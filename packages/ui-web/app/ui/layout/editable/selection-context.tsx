'use client';
// SelectionContext.js
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectionContextType {
    selectedElement: any;
    setSelectedElement: React.Dispatch<React.SetStateAction<any>>;
}

const SelectionContext = createContext<SelectionContextType>({
    selectedElement: null,
    setSelectedElement: () => { }
});

interface SelectionProviderProps {
    children: ReactNode;
}

export const SelectionProvider: React.FC<SelectionProviderProps> = ({ children }) => {
    const [selectedElement, setSelectedElement] = useState<any>(undefined);

    return (
        <SelectionContext.Provider value={{ selectedElement, setSelectedElement }}>
            {children}
        </SelectionContext.Provider>
    );
};

export const useSelection = () => useContext(SelectionContext);
