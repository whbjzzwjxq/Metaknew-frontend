export default {}
declare global {
    interface BaseSizeInGraph extends SettingComponent {
        x: number;
        y: number;
        size: number;
        scaleX: number;
    }

    type NodeViewType = 'rectangle' | 'rhombus' | 'ellipse';
    interface NodeStyleSettingGraph extends SettingGroup {
        Base: BaseSizeInGraph;
        View: {
            color: Color;
            opacity: number;
            viewType: NodeViewType;
        };
        Border: {
            width: number;
            color: Color;
            isDash: boolean
        };
        Show: {
            showAll: boolean;
            showName: boolean;
            showImage: boolean;
            showBorder: boolean;
            showBackground: boolean;
            showInlineText: boolean;
        };
        Text: {
            inlineText: string;
            inlineTextColor: Color;
            inlineTextSize: number;
            inlineTextBreak: boolean;
            textColor: Color;
            textSize: number;
            textBreak: boolean;
        }
    }

    type LinkViewType = 'linear' | 'curve' | 'polyline'
    type LinkPointLocation = 'top' | 'bottom' | 'left' | 'right' | 'center'
    interface LinkStyleSettingGraph extends SettingGroup {
        View: {
            width: number;
            color: Color;
            viewType: LinkViewType;
            direct: 'top' | 'bottom';
            startLoc: LinkPointLocation;
            endLoc: LinkPointLocation;
            dashArray: string;
        };
        Arrow: {
            arrowLength: number;
            arrowColor: Color;
            arrowShow: boolean;
        };
        Text: {
            textExtra: string;
            textPrefix: 'append' | 'prepend';
            textLocationX: number;
            textLocationY: number;
            textColor: Color
        }
    }

    interface MediaStyleSettingGraph extends SettingGroup {
        Base: BaseSizeInGraph;
        View: {
            opacity: number,
        };
        Border: {
            width: number,
            color: Color,
            isDash: boolean,
        },
        Show: {
            showAll: boolean,
            showName: boolean,
            showBorder: boolean,
            showInlineText: boolean,
            showAppendText: boolean
        },
        Text: {
            inlineText: string,
            inlineTextColor: Color,
            inlineTextSize: number,
            inlineTextBreak: boolean,
            textSize: number,
            textColor: Color,
            textBreak: boolean
        }
    }

    interface TextStyleSettingGraph extends SettingGroup {
        Base: BaseSizeInGraph;
        Border: {
            width: number,
            color: Color,
            isDash: boolean,
            opacity: number,
            dashArray: string
        };
        Show: {
            showAll: boolean,
            showBorder: boolean,
            showInlineText: boolean,
            showBackground: boolean
        };
        Background: {
            color: Color,
            opacity: number,
        };
        Transition: {
            rotate: number,
            points: PointObject[]
        }
    }
}
