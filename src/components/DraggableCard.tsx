import React, {Fragment, useState} from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { updateCardDescription } from "@/firebase/firebaseUtils";
import { VscEdit } from "react-icons/vsc";
import {Dialog, Transition} from "@headlessui/react";
import { useRouter } from 'next/router';

interface DraggableCardProps {
  draggableId: string;
  index: number;
  text: string;
  id: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ draggableId, index, text, id }) => {
  const [cardText, setCardText] = useState(text);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLDivElement>) => {
    setCardText(event.target.innerText);
  };

  const openModal = () => {
    setIsEditing(true);
  };

  const closeModal = () => {
    setIsEditing(false);
  };

  const handleSave = async (action: any) => {
    try {
      await updateCardDescription({ id, draggableId, cardText, action }); // Call the function
      setIsEditing(false); // Close the modal after updating the description
      router.reload();
    } catch (error) {
      console.error('Error updating card description:', error);
    }
  };

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <>
        <div className='custom-draggable-card'
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ backgroundColor: snapshot.isDragging ? 'lightblue' : 'white', ...provided.draggableProps.style, }}>
          <div onBlur={handleChange}>
            {cardText}
          </div>
          <a href="#" onClick={openModal}><VscEdit/></a>
        </div>

        {/* Modal */}
        {isEditing && (
          <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0">
                <div className="fixed inset-0 bg-black bg-opacity-25"/>
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95">
                    <Dialog.Panel
                      className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Add New Task
                      </Dialog.Title>
                      <div className="mt-2">
                        <input type="text" value={cardText} onChange={(e) => setCardText(e.target.value)}
                               style={{ marginBottom: '10px', width: '100%', padding: '8px', borderRadius: '4px' }}/>
                      </div>
                      <div className="mt-4 flex space-x-5">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => handleSave('edit')}>
                          Save
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => handleSave('delete')}>
                          Delete
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeModal}>
                          Cancel
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
      )}
    </>
  )}
</Draggable>
);
};

export default DraggableCard;