const db = require("../../config/db.connect")
const PS_MEMBERS_CATEGORIES_ENUM = require("../../enums/psMembers")

// This will include the data like designations of the members
const insertDesignationsData = async () => {

    try {



        // console.log("Inserting designations")

        // const insertDesignationsQuery = `INSERT INTO designations
    
        //                             (
        //                                 title,
        //                                 title_en,
        //                                 role_desc,
        //                                 type,
        //                                 hierarchy_level
        //                             ) VALUES ?`


        // const designations = [


        //     // FOR MAIN MEMBERS
        //     { title: 'सभापती', title_en: 'President', role_desc: 'मुख्य प्रशासकीय अधिकारी', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'उपसभापती', title_en: 'Vice President', role_desc: 'सभापतीच्या अनुपस्थितीत निर्णय घेणारा अधिकारी', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'गट-विकास-अधिकारी', title_en: 'Group Development Officer', role_desc: 'गटविकास आणि प्रशासकीय जबाबदारी', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'सहाय्यक-गटविकास-अधिकारी', title_en: 'Assistant Group Development Officer', role_desc: 'गट विकास अधिकारीला सहाय्य करणारा अधिकारी', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'गटशिक्षणाधिकारी', title_en: 'Group Education Officer', role_desc: 'शैक्षणिक धोरणांचे कार्यान्वयन', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'सहाय्यक-प्रशासन-अधिकारी', title_en: 'Assistant Administration Officer', role_desc: 'प्रशासन आणि व्यवस्थापनास मदत करणारा अधिकारी', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'सहाय्यक-लेखाधिकारी', title_en: 'Assistant Accounts Officer', role_desc: 'लेखा आणि वित्त व्यवस्थापन जबाबदारी', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'विस्तार-अधिकारी', title_en: 'Extension Officer', role_desc: 'ग्रामीण विकास आणि विस्तार कार्यक्रमांचे संचालन', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'शाखा-अभियंता', title_en: 'Branch Engineer', role_desc: 'तांत्रिक काम आणि विकास प्रकल्पांचे निरीक्षण', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'कनिष्ठ-प्रशासन-अधिकारी', title_en: 'Junior Administration Officer', role_desc: 'प्रशासनाच्या रोजच्या कामकाजाचे संचालन', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'पशुधन-विकास-अधिकारी', title_en: 'Livestock Development Officer', role_desc: 'पशुसंवर्धन आणि कृषी संबंधित जबाबदारी', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },
        //     { title: 'प्रशासक', title_en: 'Administrator', role_desc: 'संपूर्ण विभागाचे प्रशासकीय संचालन', type: PS_MEMBERS_CATEGORIES_ENUM.MAIN_MEMBER },



        //     // FOR DEPUTY MEMBERS


        //     { title: 'सदस्य', title_en: 'Member', role_desc: "Member", type: PS_MEMBERS_CATEGORIES_ENUM.DEPUTY_MEMBER }

        // ];


        // const designationsEntryArray = designations.map(({ title, title_en, role_desc, type }) => {
        //     return [
        //         title,
        //         title_en,
        //         role_desc,
        //         type,
        //         -1
        //     ]
        // })

        // const result = await db.query(insertDesignationsQuery, [designationsEntryArray])
        // console.log("Designations entries done")
        // return result
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}

module.exports = { insertDesignationsData }