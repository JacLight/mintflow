'use client';

import React from 'react';
// ReactJson is the default export
import ReactJson from 'react-json-view';
// ThemeKeys might be a type, let's define it ourselves
type ThemeKeys = 'rjv-default' | 'apathy' | 'apathy:inverted' | 'ashes' | 'bespin' | 'brewer' | 'bright:inverted' | 'bright' | 'chalk' | 'codeschool' | 'colors' | 'eighties' | 'embers' | 'flat' | 'google' | 'grayscale' | 'grayscale:inverted' | 'greenscreen' | 'harmonic' | 'hopscotch' | 'isotope' | 'marrakesh' | 'mocha' | 'monokai' | 'ocean' | 'paraiso' | 'pop' | 'railscasts' | 'shapeshifter' | 'shapeshifter:inverted' | 'solarized' | 'summerfruit' | 'summerfruit:inverted' | 'threezerotwofour' | 'tomorrow' | 'tube' | 'twilight';

enum iconStype {
  'circle' = 'circle',
  'square' = 'square',
  'triangle' = 'triangle',
}

const defaultProps = {
  theme: 'rjv-default' as ThemeKeys,
  collapsed: false,
  collapseStringsAfterLength: 15,
  onAdd: true,
  onEdit: true,
  onDelete: true,
  displayObjectSize: true,
  enableClipboard: true,
  indentWidth: 4,
  displayDataTypes: true,
  iconStyle: iconStype.triangle,
  style: {
    padding: '10px',
    borderRadius: '3px',
    margin: '10px 0px',
  },
};

export const JSONViewer = props => {
  if (typeof window === 'undefined') return null;

  const { json, allowEdit, allowAdd, allowDelete } = props;

  const onUpdate = update => {
    if (props.onUpdate) {
      props.onUpdate(update);
    }
  }


  const buildCollectionTree = () => {
    return (
      <div className="">
        <ReactJson
          {...defaultProps}
          name={false}
          src={json}
          onEdit={
            allowEdit
              ? e => {
                onUpdate({ src: e.updated_src });
              }
              : false
          }
          onDelete={
            allowDelete
              ? e => {
                onUpdate({ src: e.updated_src });
              }
              : false
          }
          onAdd={
            allowAdd
              ? e => {
                onUpdate({ src: e.updated_src });
              }
              : false
          }
        />
      </div>
    );
  };
  return buildCollectionTree();
};
