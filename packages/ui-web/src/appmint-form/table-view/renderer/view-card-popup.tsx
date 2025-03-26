import React from 'react';
import { Fragment } from 'react';
import { Transition,Dialog } from '../../common/select-components';
import { IconRenderer } from '@ui/ui/icons/icon-renderer';

export const CollectionTableCardPopup = (props: { component?; isOpen; close }) => {
  // if (!props.isOpen) return null;

  const close = () => {
    if (props.close) {
      props.close();
    }
  };

  const popupComponent = props.component || <div className="p-10 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-lg my-auto mx-auto">Popup Content</div>;
  return (
    <Transition.Root show={props.isOpen || false} as={Fragment}>
      <Dialog as="div" className="relative" onClose={close}>
        <Transition.Child show={props.isOpen || false} as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 hidden bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity md:block" />
        </Transition.Child>

        <div className="fixed inset-0 z-[1105] w-screen overflow-y-auto">
          <div className="flex min-h-full justify-center text-center items-center md:px-2 lg:px-4">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden md:inline-block md:h-screen md:align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              show={props.isOpen || false}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
              enterTo="opacity-100 translate-y-0 md:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 md:scale-100"
              leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
            >
              <Dialog.Panel className="w-full transform transition relative md:my-4 max-w-[1280px]">
                {popupComponent}
                <button type="button" className="absolute right-4 top-4 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white" onClick={close}>
                  <span className="sr-only">Close</span>
                  <IconRenderer icon="HiOutlineXMark" className="h-6 w-6" aria-hidden="true" />
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
