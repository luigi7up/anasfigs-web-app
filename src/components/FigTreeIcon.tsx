import React from 'react';

export const FIG_TREE_ICON_SRC = '/icons/fig_tree.svg';

type FigTreeIconProps = {
  className?: string;
  size?: number;
};

export const FigTreeIcon: React.FC<FigTreeIconProps> = ({ className = '', size = 28 }) => (
  <img
    src={FIG_TREE_ICON_SRC}
    alt=""
    className={`fig-tree-icon ${className}`.trim()}
    width={size}
    height={size}
    aria-hidden="true"
  />
);
