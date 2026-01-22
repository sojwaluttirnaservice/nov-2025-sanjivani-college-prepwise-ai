/**
 * Grievance Status ENUM
 * 
 * @enum {string}
 */
const STATUS = {
    /** Awaiting initial review */
    PENDING: "PENDING",

    /** Under official/admin review */
    IN_REVIEW: "IN_REVIEW",

    /** Forwarded to the concerned department or officer */
    FORWARDED: "FORWARDED",

    /** Additional information requested from the user */
    NEED_MORE_INFO: "NEED_MORE_INFO",

    /** Grievance has been verified and approved */
    ACCEPTED: "ACCEPTED",

    /** Work or action has been started */
    IN_PROGRESS: "IN_PROGRESS",

    /** Grievance has been successfully resolved */
    RESOLVED: "RESOLVED",

    /** Grievance was rejected with a reason */
    REJECTED: "REJECTED",

    /** Closed due to inactivity or irrelevance */
    CLOSED: "CLOSED",
};

module.exports = STATUS;
