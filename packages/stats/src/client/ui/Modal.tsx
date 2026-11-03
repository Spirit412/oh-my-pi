import { Modal as AntdModal } from "antd";
import type React from "react";
import { useT } from "../i18n";

export interface ModalAction {
	label: string;
	onClick: () => void;
	disabled?: boolean;
}

export interface ModalProps {
	open: boolean;
	title: React.ReactNode;
	/** Called on Esc, overlay click, the close icon, and the cancel button. */
	onClose: () => void;
	/** Confirming action; rendered as the primary button. */
	primaryAction?: ModalAction;
	cancelLabel?: string;
	children: React.ReactNode;
}

/** Centered confirm/cancel dialog over a dimmed overlay. */
export function Modal({ open, title, onClose, primaryAction, cancelLabel, children }: ModalProps) {
	const t = useT();
	return (
		<AntdModal
			open={open}
			title={title}
			onCancel={onClose}
			cancelText={cancelLabel ?? t("ui.modal.cancel")}
			okText={primaryAction?.label}
			okButtonProps={{ disabled: primaryAction?.disabled ?? false, onClick: primaryAction?.onClick }}
			footer={(_, { OkBtn, CancelBtn }) => (
				<>
					<CancelBtn />
					{primaryAction && <OkBtn />}
				</>
			)}
		>
			{children}
		</AntdModal>
	);
}
