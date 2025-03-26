/**
 * Interface for component styling
 */
export interface ComponentStyling {
    [key: string]: string | ComponentStyling;
}

/**
 * Interface for theme styling
 */
export interface ThemeStyling {
    [componentType: string]: ComponentStyling;
}

/**
 * Base theme - the single source of truth for all styling
 * Every component must get its styling from this theme
 * 
 * Note: Styles from element-style-class.ts have been migrated here
 */
export const baseTheme: ThemeStyling = {
    // Layout components
    'appmint-form': {
        root: 'relative my-2  dark:bg-gray-900 bg-white p-4 rounded-xl shadow-lg',
        container: 'relative my-2',
        title: 'block text-sm font-medium text-gray-700 mb-1',
        description: 'mt-1 text-xs text-gray-500',
        error: 'mt-1 text-xs text-red-500',
    },
    tab: {
        container: 'w-full border-b border-gray-200 dark:border-gray-700',
        button: 'text-sm flex gap-2 items-center whitespace-nowrap border-b hover:border-b-blue-400 dark:hover:border-b-blue-300 border-b-gray-200 dark:border-b-gray-700 p-1 text-gray-600 dark:text-gray-300',
        buttonActive: 'border-b-orange-400 dark:border-b-orange-300 text-gray-800 dark:text-gray-100',
        content: 'p-4 dark:bg-gray-800',
    },
    accordion: {
        container: 'w-full',
        header: 'px-4 py-2 mb-px items-center border border-gray-100 dark:border-gray-700 flex justify-between bg-white dark:bg-gray-800 gap-4 text-xs shadow cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900',
        headerActive: 'bg-cyan-100 dark:bg-cyan-800',
        content: 'p-4 dark:bg-gray-800',
    },
    slider: {
        container: 'w-full',
        content: 'dark:bg-gray-800',
        button: 'h-5 w-5 flex items-center justify-center border-cyan-400 dark:border-cyan-600 border rounded p-0 hover:bg-cyan-300 dark:hover:bg-cyan-700',
        buttonActive: 'bg-yellow-200 dark:bg-yellow-700',
    },
    collapsible: {
        container: 'w-full',
        header: 'p-2 flex justify-between items-center cursor-pointer border-b-1 border-gray-300 dark:border-gray-600 gap-2 bg-gray-50 dark:bg-gray-700',
        content: 'p-2 dark:bg-gray-800',
    },
    // Common styling for all components
    common: {
        container: 'relative my-2',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        'label-inner': 'text-sm font-medium text-gray-700 dark:text-gray-300',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
        helpContainer: 'ml-8',
        icon: 'h-5 w-5 text-gray-400 dark:text-gray-500',
        iconContainer: 'flex items-center justify-center',
        'input-container': 'w-full my-1', // Added 'my-1' from element-style-class.ts
    },
    // Icon and image components
    'control-icon': {
        icon: 'h-5 w-5 text-gray-400 dark:text-gray-500',
    },
    'control-image': {
        image: 'w-10 h-10 object-cover rounded dark:border-gray-700',
    },
    // Layout components
    layout: {
        container: 'w-full mx-auto my-2',
        'container-array': 'w-full mx-auto my-0',
        section: 'mb-4',
        row: 'flex flex-wrap -mx-2',
        column: 'px-2',
        divider: 'border-t border-gray-200 dark:border-gray-700 my-4',
        'control-input': 'w-full',
    },
    // Form components
    form: {
        container: 'space-y-4',
        section: 'bg-white dark:bg-gray-800 shadow rounded-lg p-4',
        header: 'text-lg font-medium text-gray-900 dark:text-gray-100 mb-4',
        footer: 'mt-4 flex justify-end space-x-3',
        group: 'gap-3',
    },
    'form-array': {
        'array-item': 'relative mb-0 even:bg-gray-50  dark:even:bg-gray-600  dark:bg-gray-700 flex gap-2 items-center',
        'array-item-horizontal': 'bg-white dark:bg-gray-800 shadow rounded-lg p-4',
    },
    'social-textarea': {
        container: 'relative my-2 w-full',
        'container-array': 'relative my-0 w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        textarea: 'block w-full p-2 dark:bg-gray-700 dark:text-white',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
        icon: 'h-5 w-5 text-gray-400 dark:text-gray-500',
        iconContainer: 'absolute inset-y-0 right-0 flex items-center pr-3',
        prefix: 'flex select-none items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        suffix: 'flex select-none items-center pr-3 text-gray-500 dark:text-gray-400 sm:text-sm',
    },

    // Text input styling
    text: {
        container: 'relative my-2 w-full',
        'container-array': 'relative my-0 w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        input: 'block w-full rounded-md border-gray-300 dark:border-gray-600 border shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 px-2 py-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
        icon: 'h-5 w-5 text-gray-400 dark:text-gray-500',
        iconContainer: 'absolute inset-y-0 right-0 flex items-center pr-3',
        prefix: 'flex select-none items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        suffix: 'flex select-none items-center pr-3 text-gray-500 dark:text-gray-400 sm:text-sm',
    },
    // Number input styling
    number: {
        container: 'relative my-2 w-full',
        'container-array': 'relative my-0 w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        input: 'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm border py-1 px-2 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
        prefix: 'flex select-none items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        suffix: 'flex select-none items-center pr-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        stepper: 'absolute inset-y-0 right-0 flex flex-col',
        stepperUp: 'flex-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
        stepperDown: 'flex-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
    },
    'number-range': {
        container: 'relative my-2  w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        maxInput: 'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm border py-1 px-2 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        minInput: 'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm border py-1 px-2 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
        prefix: 'flex select-none items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        suffix: 'flex select-none items-center pr-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        stepper: 'absolute inset-y-0 right-0 flex flex-col',
        stepperUp: 'flex-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
        stepperDown: 'flex-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
    },
    // Textarea styling
    textarea: {
        container: 'relative my-2  w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        textarea: 'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Date range styling
    'date-range': {
        container: 'relative my-2  w-full',
        input: 'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        prefix: 'flex select-none items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        suffix: 'flex select-none items-center pr-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        calendar: 'bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 mt-1',
        calendarHeader: 'flex justify-between items-center mb-2',
        calendarDay: 'w-8 h-8 flex items-center justify-center rounded-full',
        calendarDaySelected: 'bg-indigo-600 text-white',
        calendarDayInRange: 'bg-indigo-100 dark:bg-indigo-800',
        calendarDayDisabled: 'text-gray-300 dark:text-gray-600',
        calendarNavButton: 'p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700',
    },
    // Select styling
    select: {
        container: 'relative my-2  w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        dropdown: 'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        option: 'py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
        placeholder: 'text-gray-400 dark:text-gray-500',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Select single styling (from element-style-class.ts)
    selectsingle: {
        container: 'items-center justify-center ',
    },
    // Select many styling
    selectmany: {
        container: 'items-center justify-center  w-full',
    },
    // Listbox styling
    listbox: {
        container: 'relative w-full',
        button: 'relative w-full cursor-default rounded bg-white dark:bg-gray-700 pl-2 py-1 pr-8 text-left text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm',
        options: 'mt-1 max-h-80 min-w-48 overflow-auto rounded bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none sm:text-sm',
        option: 'relative cursor-default select-none py-2 pl-3 pr-9',
        optionActive: 'bg-indigo-600 text-white',
        optionInactive: 'text-gray-900 dark:text-gray-100',
        icon: 'h-5 w-5 flex-shrink-0 rounded-full',
        selectedIcon: 'h-5 w-5',
        selectedIconActive: 'text-white',
        selectedIconInactive: 'text-indigo-600 dark:text-indigo-400',
        label: 'ml-3 block truncate',
        labelSelected: 'font-semibold',
        labelUnselected: 'font-normal',
        placeholder: 'block truncate text-gray-400 dark:text-gray-500',
        chevron: 'h-5 w-5 text-gray-400 dark:text-gray-500',
    },
    // Checkbox styling
    checkbox: {
        container: 'relative flex items-start my-2',
        input: 'h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700',
        label: 'ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Radio styling
    radio: {
        container: 'relative my-2',
        group: 'space-y-2',
        option: 'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none',
        optionSelected: 'bg-indigo-50 dark:bg-indigo-900 border-indigo-200 dark:border-indigo-700',
        optionUnselected: 'border-gray-200 dark:border-gray-700',
        input: 'h-4 w-4 border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700',
        label: 'ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300',
        labelSelected: 'text-indigo-900 dark:text-indigo-100 font-semibold',
        labelUnselected: 'text-gray-900 dark:text-gray-100',
        icon: 'h-5 w-5 flex-shrink-0 rounded-full',
        checkmark: 'h-5 w-5 text-indigo-600 dark:text-indigo-400',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400 ml-7',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Switch styling
    switch: {
        container: 'relative flex items-center my-2',
        track: 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:ring-offset-2',
        trackOn: 'bg-indigo-600 dark:bg-indigo-500',
        trackOff: 'bg-gray-200 dark:bg-gray-600',
        thumb: 'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out',
        thumbOn: 'translate-x-5',
        thumbOff: 'translate-x-0',
        icon: 'h-3 w-3',
        iconOn: 'text-indigo-600 dark:text-indigo-400',
        iconOff: 'text-gray-400 dark:text-gray-500',
        label: 'ml-3 text-sm font-medium text-gray-700 dark:text-gray-300',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Array styling
    array: {
        container: 'relative my-2 space-y-2',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        item: 'relative border border-gray-200 dark:border-gray-700 rounded-md p-3 dark:bg-gray-800',
        addButton: 'mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400',
        removeButton: 'absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Color picker styling
    color: {
        container: 'relative my-2',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        input: 'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        preview: 'w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden',
        palette: 'grid grid-cols-8 gap-1 p-2 dark:bg-gray-800',
        paletteItem: 'w-6 h-6 rounded-md cursor-pointer',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Button styling (added flex from element-style-class.ts)
    button: {
        container: 'relative my-2 flex',
        button: 'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Map styling (from element-style-class.ts)
    map: {
        container: 'h-96 w-full dark:bg-gray-800 dark:text-gray-200',
    },
    // Data gallery view styling
    'data-gallery-view': {
        container: 'h-full w-full relative',
        tabs: 'flex gap-1 w-full bg-gray-100 dark:bg-gray-700 px-3',
        tab: 'text-sm px-6 py-2 bg-gray-50 dark:bg-gray-600 dark:text-gray-200',
        tabActive: 'bg-cyan-100 dark:bg-cyan-800',
        header: 'bg-purple-700 h-full text-white px-2 py-1',
        content: 'h-[calc(100%-100px)] w-full mt-4 dark:bg-gray-800',
        footer: 'flex items-center gap-4 justify-between absolute bottom-1 w-full px-5 bg-white dark:bg-gray-800 py-2',
        button: 'text-sm hover:bg-cyan-100 dark:hover:bg-cyan-900 pl-2 pr-3 py-1 rounded-full flex items-center gap-2 border border-gray-200 dark:border-gray-700 dark:text-gray-200',
        icon: 'w-5 h-5 rounded-full shadow bg-white dark:bg-gray-700 p-1',
    },
};

/**
 * Primary theme with blue accents
 */
export const primaryTheme: ThemeStyling = {
    common: {
        container: 'relative my-2',
        label: 'block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1',
        description: 'mt-1 text-xs text-blue-500 dark:text-blue-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    text: {
        input: 'block w-full rounded-md border-blue-300 dark:border-blue-700 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm dark:bg-gray-700 dark:text-white',
    },
    select: {
        select: 'block w-full rounded-md border-blue-300 dark:border-blue-700 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        option: 'py-2 px-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900',
    },
    selectsingle: {
        dropdown: 'block w-full rounded-md border-blue-300 dark:border-blue-700 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        option: 'py-2 px-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900',
    },
    selectmany: {
        dropdown: 'block w-full rounded-md border-blue-300 dark:border-blue-700 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        option: 'py-2 px-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900',
    },
    checkbox: {
        input: 'h-4 w-4 rounded border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700',
    },
    radio: {
        optionSelected: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700',
        input: 'h-4 w-4 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700',
    },
    switch: {
        trackOn: 'bg-blue-600 dark:bg-blue-500',
        trackOff: 'bg-gray-200 dark:bg-gray-600',
    },
    array: {
        addButton: 'mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400',
    },
};

/**
 * Secondary theme with green accents
 */
export const secondaryTheme: ThemeStyling = {
    common: {
        container: 'relative my-2',
        label: 'block text-sm font-medium text-green-700 dark:text-green-300 mb-1',
        description: 'mt-1 text-xs text-green-500 dark:text-green-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    text: {
        input: 'block w-full rounded-md border-green-300 dark:border-green-700 shadow-sm focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400 sm:text-sm dark:bg-gray-700 dark:text-white',
    },
    select: {
        select: 'block w-full rounded-md border-green-300 dark:border-green-700 shadow-sm focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        option: 'py-2 px-3 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900',
    },
    selectsingle: {
        dropdown: 'block w-full rounded-md border-green-300 dark:border-green-700 shadow-sm focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        option: 'py-2 px-3 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900',
    },
    selectmany: {
        dropdown: 'block w-full rounded-md border-green-300 dark:border-green-700 shadow-sm focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        option: 'py-2 px-3 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900',
    },
    checkbox: {
        input: 'h-4 w-4 rounded border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 focus:ring-green-500 dark:focus:ring-green-400 dark:bg-gray-700',
    },
    radio: {
        optionSelected: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700',
        input: 'h-4 w-4 border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 focus:ring-green-500 dark:focus:ring-green-400 dark:bg-gray-700',
    },
    switch: {
        trackOn: 'bg-green-600 dark:bg-green-500',
        trackOff: 'bg-gray-200 dark:bg-gray-600',
    },
    array: {
        addButton: 'mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400',
    },
};

/**
 * Minimal theme with subtle styling
 */
export const minimalTheme: ThemeStyling = {
    // Layout components
    tab: {
        container: 'w-full border-b border-gray-100 dark:border-gray-800',
        button: 'text-xs flex gap-1 items-center whitespace-nowrap border-b hover:border-b-gray-400 dark:hover:border-b-gray-500 border-b-gray-100 dark:border-b-gray-800 p-1 text-gray-500 dark:text-gray-400',
        buttonActive: 'border-b-gray-500 dark:border-b-gray-400 text-gray-700 dark:text-gray-300',
        content: 'p-2 dark:bg-gray-800',
    },
    accordion: {
        container: 'w-full',
        header: 'px-3 py-1 mb-px items-center border border-gray-50 dark:border-gray-800 flex justify-between bg-white dark:bg-gray-800 gap-2 text-xs shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700',
        headerActive: 'bg-gray-100 dark:bg-gray-700',
        content: 'p-2 dark:bg-gray-800',
    },
    slider: {
        container: 'w-full',
        content: 'dark:bg-gray-800',
        button: 'h-4 w-4 flex items-center justify-center border-gray-300 dark:border-gray-600 border rounded p-0 hover:bg-gray-200 dark:hover:bg-gray-700',
        buttonActive: 'bg-gray-200 dark:bg-gray-600',
    },
    collapsible: {
        container: 'w-full',
        header: 'p-1 flex justify-between items-center cursor-pointer border-b-1 border-gray-200 dark:border-gray-700 gap-1 bg-gray-50 dark:bg-gray-700',
        content: 'p-1 dark:bg-gray-800',
    },
    'data-gallery-view': {
        container: 'h-full w-full relative',
        tabs: 'flex gap-1 w-full bg-gray-50 dark:bg-gray-800 px-2',
        tab: 'text-xs px-4 py-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
        tabActive: 'bg-gray-200 dark:bg-gray-600',
        header: 'bg-gray-500 h-full text-white px-2 py-1',
        content: 'h-[calc(100%-80px)] w-full mt-2 dark:bg-gray-800',
        footer: 'flex items-center gap-4 justify-between absolute bottom-1 w-full px-4 bg-white dark:bg-gray-800 py-1',
        button: 'text-xs hover:bg-gray-100 dark:hover:bg-gray-700 pl-2 pr-2 py-1 rounded-full flex items-center gap-1 border border-gray-100 dark:border-gray-700 dark:text-gray-300',
        icon: 'w-4 h-4 rounded-full shadow bg-white dark:bg-gray-700 p-1',
    },
    common: {
        container: 'relative my-1',
        label: 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1',
        description: 'mt-1 text-xs text-gray-400 dark:text-gray-500',
        error: 'mt-1 text-xs text-red-400 dark:text-red-500',
    },
    text: {
        container: 'w-full',
        input: 'block w-full rounded-md border-gray-200 dark:border-gray-700 shadow-sm focus:border-gray-300 dark:focus:border-gray-600 focus:ring-gray-300 dark:focus:ring-gray-600 sm:text-sm dark:bg-gray-800 dark:text-gray-200',
    },
    select: {
        container: 'w-full',
        select: 'block w-full rounded-md border-gray-200 dark:border-gray-700 shadow-sm focus:border-gray-300 dark:focus:border-gray-600 focus:ring-gray-300 dark:focus:ring-gray-600 sm:text-sm dark:bg-gray-800 dark:text-gray-200',
        option: 'py-1 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm',
    },
    selectsingle: {
        dropdown: 'block w-full rounded-md border-gray-200 dark:border-gray-700 shadow-sm focus:border-gray-300 dark:focus:border-gray-600 focus:ring-gray-300 dark:focus:ring-gray-600 sm:text-sm dark:bg-gray-800 dark:text-gray-200',
        option: 'py-1 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm',
    },
    selectmany: {
        dropdown: 'block w-full rounded-md border-gray-200 dark:border-gray-700 shadow-sm focus:border-gray-300 dark:focus:border-gray-600 focus:ring-gray-300 dark:focus:ring-gray-600 sm:text-sm dark:bg-gray-800 dark:text-gray-200',
        option: 'py-1 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm',
    },
    checkbox: {
        container: 'relative flex items-start my-1',
        input: 'h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 focus:ring-gray-400 dark:focus:ring-gray-500 dark:bg-gray-700',
        label: 'ml-2 block text-xs font-medium text-gray-500 dark:text-gray-400',
    },
    radio: {
        container: 'relative my-1',
        group: 'space-y-1',
        option: 'relative flex cursor-pointer rounded-lg border p-2 focus:outline-none',
        optionSelected: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        optionUnselected: 'border-gray-100 dark:border-gray-800',
        input: 'h-3 w-3 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 focus:ring-gray-400 dark:focus:ring-gray-500 dark:bg-gray-700',
        label: 'ml-2 block text-xs font-medium text-gray-500 dark:text-gray-400',
    },
    switch: {
        container: 'relative flex items-center my-1',
        track: 'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-1',
        trackOn: 'bg-gray-500 dark:bg-gray-400',
        trackOff: 'bg-gray-200 dark:bg-gray-600',
        thumb: 'pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out',
        thumbOn: 'translate-x-4',
        thumbOff: 'translate-x-0',
        label: 'ml-2 text-xs font-medium text-gray-500 dark:text-gray-400',
    },
    array: {
        container: 'relative my-1 space-y-1',
        item: 'relative border border-gray-100 dark:border-gray-800 rounded-md p-2 dark:bg-gray-800',
        addButton: 'mt-1 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500',
        removeButton: 'absolute top-1 right-1 text-gray-300 hover:text-gray-400 dark:text-gray-600 dark:hover:text-gray-500',
    },
};
