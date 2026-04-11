'use client';
import React from 'react';
import { Image } from 'expo-image';
import type { ImageContentFit } from 'expo-image';
import {
	StyleSheet,
	View,
	type ImageBackgroundProps as RNImageBackgroundProps,
} from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';

const imageBackgroundStyle = tva({});

function resizeModeToContentFit(
	mode?: RNImageBackgroundProps['resizeMode'],
): ImageContentFit {
	switch (mode) {
		case 'contain':
			return 'contain';
		case 'stretch':
			return 'fill';
		case 'center':
			return 'none';
		case 'repeat':
		default:
			return 'cover';
	}
}

type Props = RNImageBackgroundProps & { className?: string };

const ImageBackground = React.forwardRef<
	React.ComponentRef<typeof View>,
	Props
>(function ImageBackground(
	{
		source,
		style,
		imageStyle,
		resizeMode,
		children,
		className,
		imageRef: _imageRef,
		...rest
	},
	ref,
) {
	const contentFit = resizeModeToContentFit(resizeMode);

	return (
		<View
			ref={ref}
			style={style}
			className={imageBackgroundStyle({ class: className })}
			{...rest}
		>
			<Image
				source={source}
				style={[StyleSheet.absoluteFillObject, imageStyle]}
				contentFit={contentFit}
				pointerEvents="none"
			/>
			{children}
		</View>
	);
});

ImageBackground.displayName = 'ImageBackground';

export { ImageBackground };
