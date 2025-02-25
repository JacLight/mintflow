export const isVoidElement = (tag: string): boolean => {
    const voidElements = [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr',
    ];
    return voidElements.includes(tag);
};

export const isEditableElement = (tag: string): boolean => {
    const editableTags = [
        'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li',
        'a', 'button', 'td', 'th', 'label', 'pre', 'blockquote',
        'figcaption', 'caption', 'summary', 'dt', 'dd',
    ];
    return editableTags.includes(tag);
};
