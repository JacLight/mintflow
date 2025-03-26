import React, { Fragment, useEffect, useState } from 'react';

interface TransitionProps {
    show: boolean;
    as?: React.ElementType;
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
    children: React.ReactNode;
}

export const Transition: React.FC<TransitionProps> & {
    Child: typeof TransitionChild;
    Root: typeof TransitionRoot;
} = ({
    show,
    as: Component = 'div',
    enter = '',
    enterFrom = '',
    enterTo = '',
    leave = '',
    leaveFrom = '',
    leaveTo = '',
    children
}) => {
        const [mounted, setMounted] = useState(false);
        const [transitionClasses, setTransitionClasses] = useState('');

        useEffect(() => {
            if (show && !mounted) {
                setMounted(true);
                // Apply enter animation classes
                setTransitionClasses(`${enter} `);

                // After a small delay, switch to enterTo class
                const enterTimer = setTimeout(() => {
                    setTransitionClasses(`${enter} ${enterTo}`);
                }, 10);

                return () => clearTimeout(enterTimer);
            } else if (!show && mounted) {
                // Apply leave animation classes
                setTransitionClasses(`${leave} ${leaveFrom}`);

                // After a small delay, switch to leaveTo class
                const leaveTimer = setTimeout(() => {
                    setTransitionClasses(`${leave} ${leaveTo}`);
                }, 10);

                // After animation completes, unmount
                const unmountTimer = setTimeout(() => {
                    setMounted(false);
                }, 300); // Adjust based on your animation duration

                return () => {
                    clearTimeout(leaveTimer);
                    clearTimeout(unmountTimer);
                };
            }

            return undefined;
        }, [show, mounted, enter, enterFrom, enterTo, leave, leaveFrom, leaveTo]);

        if (!mounted && !show) return null;

        if (Component === Fragment) {
            return <>{children}</>;
        }

        return (
            <Component className={transitionClasses}>
                {children}
            </Component>
        );
    };

// For compatibility with Headless UI API
export const TransitionChild = Transition;

export const TransitionRoot = Transition;

// Add Child and Root properties to Transition
Transition.Child = TransitionChild;
Transition.Root = TransitionRoot;

export default Transition;
