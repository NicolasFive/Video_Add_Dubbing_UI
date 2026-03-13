'use client';

import { forwardRef, useId, useState } from 'react';
import { formatFileSize } from '@/lib/utils';

interface FileUploadProps {
	id?: string;
	accept?: string;
	title?: string;
	description?: string;
	selectedFile: File | null;
	onFileSelect: (file: File) => void;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
	({
		id,
		accept = 'video/*,audio/*',
		title = '拖拽文件到这里，或点击选择文件',
		description = '支持视频和音频文件',
		selectedFile,
		onFileSelect,
	}, ref) => {
		const [isDragging, setIsDragging] = useState(false);
		const inputId = id ?? `media-upload-${useId()}`;

		const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				onFileSelect(file);
			}
		};

		const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
			event.preventDefault();
			setIsDragging(false);
			const file = event.dataTransfer.files?.[0];
			if (file) {
				onFileSelect(file);
			}
		};

		return (
			<div>
				<input
					ref={ref}
					id={inputId}
					type="file"
					accept={accept}
					className="hidden"
					onChange={handleInputChange}
				/>
				<label
					htmlFor={inputId}
					onDragOver={(event) => {
						event.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleDrop}
					className={
						`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ` +
						(isDragging
							? 'border-primary-500 bg-primary-50'
							: 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/40')
					}
				>
					<span className="text-4xl">📤</span>
					<p className="mt-3 text-base font-medium text-gray-800">
						{title}
					</p>
					<p className="mt-1 text-sm text-gray-500">{description}</p>

					{selectedFile && (
						<div className="mt-4 w-full rounded-lg border border-gray-200 bg-white p-3 text-left">
							<p className="truncate text-sm font-medium text-gray-900">{selectedFile.name}</p>
							<p className="mt-1 text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
						</div>
					)}
				</label>
			</div>
		);
	}
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;
