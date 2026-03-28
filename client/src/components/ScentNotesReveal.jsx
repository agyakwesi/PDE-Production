import React, { useState, useCallback } from 'react';
import './ScentNotesReveal.css';

/**
 * Split a comma-separated notes string into a { top, heart, base } pyramid.
 * If the string contains explicit "Top:", "Heart:", "Base:" prefixes we honour
 * those; otherwise we divide the list into thirds.
 */
const buildPyramid = (notes) => {
  if (!notes) return null;

  // Accept both "a, b, c" strings and ["a", "b", "c"] arrays
  const all = Array.isArray(notes)
    ? notes.map(n => n.replace(/(Top:|Heart:|Base:)/gi, '').trim()).filter(Boolean)
    : notes.split(',').map(n => n.trim()).filter(Boolean);

  if (all.length === 0) return null;

  const third = Math.max(1, Math.ceil(all.length / 3));
  return {
    top: all.slice(0, third),
    heart: all.slice(third, third * 2),
    base: all.slice(third * 2),
  };
};

/* ─── Line-art SVG icons for each tier ─── */

const OpeningIcon = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Burst / zest – represents the fleeting opening */}
    <circle cx="24" cy="24" r="6" />
    <line x1="24" y1="4" x2="24" y2="12" />
    <line x1="24" y1="36" x2="24" y2="44" />
    <line x1="4" y1="24" x2="12" y2="24" />
    <line x1="36" y1="24" x2="44" y2="24" />
    <line x1="9.9" y1="9.9" x2="15.5" y2="15.5" />
    <line x1="32.5" y1="32.5" x2="38.1" y2="38.1" />
    <line x1="9.9" y1="38.1" x2="15.5" y2="32.5" />
    <line x1="32.5" y1="15.5" x2="38.1" y2="9.9" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Rose / floral – represents the heart */}
    <circle cx="24" cy="20" r="8" />
    <path d="M18 26 C18 34, 24 38, 24 38 C24 38, 30 34, 30 26" />
    <path d="M20 14 C20 10, 24 8, 24 8 C24 8, 28 10, 28 14" />
    <line x1="24" y1="38" x2="24" y2="44" />
    <line x1="20" y1="42" x2="24" y2="44" />
    <line x1="28" y1="42" x2="24" y2="44" />
  </svg>
);

const BaseIcon = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Root / earth – represents the lingering base */}
    <rect x="14" y="8" width="20" height="24" rx="4" />
    <line x1="18" y1="32" x2="16" y2="44" />
    <line x1="24" y1="32" x2="24" y2="44" />
    <line x1="30" y1="32" x2="32" y2="44" />
    <line x1="18" y1="14" x2="30" y2="14" />
    <line x1="18" y1="20" x2="30" y2="20" />
  </svg>
);

const TIERS = [
  { key: 'top', label: 'Opening', Icon: OpeningIcon },
  { key: 'heart', label: 'Heart', Icon: HeartIcon },
  { key: 'base', label: 'Base', Icon: BaseIcon },
];

const FALLBACK = {
  top: ['Saffron Thread', 'Bergamot Zest', 'Black Pepper'],
  heart: ['Damascus Rose', 'Leather Accord', 'Smoked Papyrus'],
  base: ['Cambodian Oud', 'Ambergris', 'Madagascar Vanilla'],
};

const ScentNotesReveal = ({ notes }) => {
  const pyramid = buildPyramid(notes) || FALLBACK;
  const [revealedIdx, setRevealedIdx] = useState(null);

  const handleCardClick = useCallback((idx) => {
    setRevealedIdx(prev => (prev === idx ? null : idx));
  }, []);

  return (
    <section className="scent-notes-section">
      <h2 className="scent-notes-section__title">Scent Architecture</h2>
      <p className="scent-notes-section__subtitle">The Chronology of Evaporation</p>

      <div className="scent-notes-grid">
        {TIERS.map(({ key, label, Icon }, idx) => {
          const tierNotes = pyramid[key] || [];
          const isRevealed = revealedIdx === idx;

          return (
            <div
              key={key}
              className={`scent-note-card${isRevealed ? ' is-revealed' : ''}`}
              onClick={() => handleCardClick(idx)}
            >
              <div className="scent-note-card__icon">
                <Icon />
              </div>
              <div className="scent-note-card__label">{label}</div>
              <div className="scent-note-card__hint">Hover to Reveal</div>

              <ul className="scent-note-card__notes">
                {tierNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ScentNotesReveal;
