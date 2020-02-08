export const nodeTemplateTheme: Record<string, () => Record<string, Record<string, any>>> = {
    inPath: () => ({
        Base: {
            size: 0,
            scaleX: 1,
            x: 0,
            y: 0,
            color: '#eaecee',
            opacity: 0.5,
            type: 'ellipse',
            isMain: false
        },
        Border: {
            width: 1,
            color: '#95b3ff',
            isDash: true
        },
        Show: {
            showAll: true,
            showName: true,
            showImage: true,
            showBorder: true,
            showFill: true,
            showInlineText: false
        },
        Text: {
            inlineText: '',
            inlineTextColor: '#FFFFFF',
            inlineTextSize: 8,
            inlineTextBreak: false,
            textSize: 8,
            textColor: '#000000',
            textBreak: false
        },
    }),
};
