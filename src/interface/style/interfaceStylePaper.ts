export default {}
declare global {

    interface BaseSizeInPaper extends Record<string, number>{
        cols: number,
        height: number,
        index: number
    }

    interface NodeStyleSettingPaper extends SettingGroupInPage {
        Base: BaseSizeInPaper;
        Show: {
            showTitle: boolean;
        };
        Background: {
            backgroundColor: Color;
            backgroundOpacity: number;
        }
    }

    interface MediaStyleSettingPaper extends SettingGroupInPage {
        Base: BaseSizeInPaper;
    }

    interface LinkStyleSettingPaper extends SettingGroupInPage {

    }

    interface TextStyleSettingPaper extends SettingGroupInPage {
        Base: BaseSizeInPaper;
    }

    interface PaperConfigure extends DocumentConfigureAny {

    }
}
