import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

const NodeDetails = ({ node, onClose }) => {
    return (
        <AnimatePresence>
            {node && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 20 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        width: '400px',
                        height: '100vh',
                        background: COLORS.panelBg,
                        backdropFilter: 'blur(10px)',
                        borderLeft: `1px solid ${COLORS.hairline}`,
                        padding: '2rem',
                        boxSizing: 'border-box',
                        zIndex: 100,
                        color: COLORS.textPrimary
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'transparent',
                            border: 'none',
                            color: COLORS.textPrimary,
                            cursor: 'pointer'
                        }}
                    >
                        <X size={24} />
                    </button>

                    <h2 style={{
                        fontFamily: FONTS.display,
                        fontWeight: 600,
                        fontSize: '2rem',
                        marginBottom: '0.5rem',
                        background: `linear-gradient(to right, ${COLORS.textPrimary}, ${COLORS.node[node.type] || COLORS.node.skill})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {node.label}
                    </h2>

                    <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontFamily: FONTS.mono,
                        fontSize: '0.75rem',
                        marginBottom: '2rem',
                        backgroundColor: COLORS.hairline,
                        color: COLORS.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                    }}>
                        {node.type}
                    </div>

                    <p style={{ lineHeight: '1.6', fontSize: '1.1rem', color: COLORS.textMuted }}>
                        {node.details}
                    </p>

                    {node.link && (
                        <a
                            href={node.link}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-block',
                                marginTop: '1rem',
                                fontFamily: FONTS.mono,
                                fontSize: '0.85rem',
                                color: COLORS.node.me,
                                textDecoration: 'none'
                            }}
                        >
                            View repository →
                        </a>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NodeDetails;
