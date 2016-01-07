window.Coco = window.Coco || {};

window.Coco.Text = {
    Search: {
        SelectTitle: "選択して探す",
        SelectGroup: "グループ",
        SelectInitial: "よみがな",
        KeywordTitle: "検索して探す",
        Placeholder: "検索ワードを入力",
        KeywordResultPrefix: "「",
        KeywordResultSuffix: "」の結果",
        InitialList: [
            ["あ"], ["い"], ["う", "ヴ"], ["え"], ["お"],
            ["か", "が"], ["き", ""], ["く", ""], ["け", ""], ["こ", ""],
            ["さ", "ざ"], ["し", "じ"], ["す", "ず"], ["せ", "ぜ"], ["そ", "ぞ"],
            ["た", "だ"], ["ち", "ぢ"], ["つ", "づ"], ["て", "で"], ["と", "ど"],
            ["な"], ["に"], ["ぬ"], ["ね"], ["の"],
            ["は", "ば", "ぱ"], ["ひ", "び", "ぴ"], ["ふ", "ぶ", "ぷ"], ["へ", "べ", "ぺ"], ["ほ", "ぼ", "ぽ"],
            ["ま"], ["み"], ["む"], ["め"], ["も"],
            ["や"], ["ゆ"], ["よ"],
            ["ら"], ["り"], ["る"], ["れ"], ["ろ"],
            ["わ"], ["を"], ["ん"]
        ]
    },
    Sort: {
        Default: "既定順",
        Kana: "かな順",
        Id: "ID順"
    },
    List: {
        Id: "社員番号",
        Name: "名前",
        Kana: "かな",
        Group: "部署",
        GroupCd: "部署コード",
        Rank: "役職",
        Phone: "電話番号",
        Status: "ステータス",
        Jotai: "状態",
        Yukisaki: "行先",
        Nichiji: "日時",
        Comment: "コメント",
        LastUpdate: "最終更新"
    },
    ListEdit: {
        CommentPlaceholder: "コメント"
    },
    StatusList: ["社内", "社外", "休暇", "帰宅"]
};
