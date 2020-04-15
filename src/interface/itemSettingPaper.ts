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
}

export default {

}
