declare global {
    interface BaseSizePaper {
        cols: number,
        height: number
    }
    interface NodeStyleSettingPaper {
        Base: BaseSizePaper,

    }
    interface PaperSetting extends Setting {

    }
    interface PaperState extends BaseState {

    }
}

export default {

}
