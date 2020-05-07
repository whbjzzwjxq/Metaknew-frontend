export default {}
declare global {

    interface BaseSizeInPaper extends Record<string, number>{
        //尺寸大小
        width: number, //1-12
        //高度
        height: number, //px
        //多少节
        section: number,
        //多少行
        row: number,
        //多少列
        order: number,
    }

    interface CardStyleInPaper extends Record<string, boolean>{
        isFlat: boolean;
        isOutlined: boolean;
        isTile: boolean
    }

    interface ItemShowInPaper extends Record<string, boolean> {
        showAll: boolean
    }

    interface CardShowInPaper extends ItemShowInPaper {
        showTitle: boolean
        showLabels: boolean
        showProps: boolean
        showDescription: boolean
    }

    interface NodeShowInPaper extends CardShowInPaper {
        showTopic: boolean
        showTranslate: boolean
        showRating: boolean
    }
    interface NodeStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
        Card: CardStyleInPaper;
        Show: NodeShowInPaper;
        Background: {
            backgroundColor: Color;
            backgroundOpacity: number;
        },
    }

    interface MediaStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
        Card: CardStyleInPaper;
        Show: CardShowInPaper
    }

    interface LinkStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
        Card: CardStyleInPaper;
        Show: CardShowInPaper
    }

    interface TextStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
        Card: CardStyleInPaper;
        Show: CardShowInPaper
    }

    type ItemStyleSettingPaper = {
        Base: BaseSizeInPaper;
        Card: CardStyleInPaper;
        Show: ItemShowInPaper
    }
}
