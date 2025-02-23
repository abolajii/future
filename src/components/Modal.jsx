import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import styled from "styled-components";

const StyledOverlay = styled(DialogPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;

  @keyframes overlayShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const StyledContent = styled(DialogPrimitive.Content)`
  position: fixed;
  top: 50px;
  left: 50%;
  transform: translate(-50%, 0%);
  width: 500px;
  min-height: 400px;
  padding: 1.5rem;
  outline: none;
  border: 1px solid #ff980020;
  background: #25262b;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  /* animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);  */
  z-index: 51;
  overflow-y: auto;
  /* display: flex; */

  &:focus {
    outline: none;
  }

  h5 {
    font-weight: 600;
    margin-bottom: 10px;
    margin-top: 6px;
  }

  /* @keyframes contentShow {
    from {
      opacity: 0;
      transform: translate(-50%, 0%) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  } */
`;

const StyledDialog = styled(DialogPrimitive.Root)``;

const StyledClose = styled(DialogPrimitive.Close)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;

  &:hover {
    color: #ccc;
  }
`;

const Modal = ({ isOpen, onClose, children }) => {
  return (
    <StyledDialog open={isOpen} onOpenChange={onClose}>
      <StyledOverlay />
      <StyledContent>
        {children}
        <StyledClose aria-label="Close">×</StyledClose>
      </StyledContent>
    </StyledDialog>
  );
};

export default Modal;
