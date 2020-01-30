export const nodeTemplateTheme: Record<string, Record<string, Record<string, any>>> = {
    'inPath': {
        Base: {
            size: 12,
            scaleX: 1,
            x: 0,
            y: 0,
            color: '#3d85ad',
            opacity: 1,
            type: 'ellipse',
            isMain: false
        },
        Border: {
            width: 2,
            color: '#95b3ff',
            isDash: true
        },
        Show: {
            showAll: true,
            showName: true,
            showPic: true,
            showBorder: true,
            showColor: true,
            showInlineText: false
        },
        Text: {
            inlineText: '',
            inlineTextColor: '#FFFFFF',
            inlineTextSize: 8,
            inlineTwoline: false,
            textSize: 8,
            textColor: '#000000',
            twoLine: false
        },
    },

};
