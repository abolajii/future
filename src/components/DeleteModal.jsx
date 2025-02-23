import React from "react";
import styled from "styled-components";
import * as Dialog from "@radix-ui/react-dialog";

const DialogOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes overlayShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const DialogContent = styled(Dialog.Content)`
  background: #25262b;
  border-radius: 0.75rem;
  border: 1px solid #ff980020;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 400px;
  max-height: 85vh;
  padding: 2rem;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes contentShow {
    from {
      opacity: 0;
      transform: translate(-50%, -48%) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  &:focus {
    outline: none;
  }
`;

const DialogTitle = styled(Dialog.Title)`
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0 0 1rem 0;
`;

const DialogDescription = styled(Dialog.Description)`
  color: #ffffff;
  opacity: 0.8;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  font-size: 0.875rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #ff980040;
  }
`;

const CancelButton = styled(Button)`
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ConfirmButton = styled(Button)`
  background: #ff4444;
  color: #ffffff;

  &:hover {
    background: #ff2222;
  }
`;

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {itemName}? This action isn't
            reversible and would change some data.
          </DialogDescription>
          <ButtonGroup>
            <Dialog.Close asChild>
              <CancelButton>Cancel</CancelButton>
            </Dialog.Close>
            <ConfirmButton onClick={onConfirm}>Confirm</ConfirmButton>
          </ButtonGroup>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DeleteModal;
