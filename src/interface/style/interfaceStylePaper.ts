export default {}
declare global {

    interface BaseSizeInPaper extends Record<string, number>{
        //尺寸大小
        width: number,
        //高度
        height: number,
        //多少节
        section: number,
        //多少行
        row: number,
        //多少列
        order: number
    }

    interface NodeStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
        Show: {
            showTitle: boolean;
            showTags: boolean;
        };
        Background: {
            backgroundColor: Color;
            backgroundOpacity: number;
        }
    }

    interface MediaStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
        Show: {
            showAsImage: boolean
        }
    }

    interface LinkStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
    }

    interface TextStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
    }
}
