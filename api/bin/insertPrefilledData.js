const { insertDesignationsData } = require("../utils/insertData/designationsQuery");

const insertPrefilledData = async () => {
    try {
        console.log('Data insertion started')
        await insertDesignationsData();
        console.log("Data insertion ended")
    } catch (err) {
        console.error('Error while inserting the data:', err);

    } finally {
        process.exit()
    }
}


insertPrefilledData()