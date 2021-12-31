const mongo = require('./index')

// takes in an installation object as an argument
// returns nothing
const storeInstallation = async (installation) => {
    const db = await mongo()
    if (installation.isEnterpriseInstall) {
        return await db
            .collection('tokens')
            .updateOne({ enterpriseId: installation.enterprise.id }, { $set: { installation } }, { upsert: true })
    }
    if (installation.team !== undefined) {
        return await db
            .collection('tokens')
            .updateOne({ teamId: installation.team.id }, { $set: { installation } }, { upsert: true })
    }
    throw new Error('Failed saving installation data to installationStore')
}
// takes in an installQuery as an argument
// installQuery = {teamId: 'string', enterpriseId: 'string', userId: 'string', conversationId: 'string', isEnterpriseInstall: boolean};
// returns installation object from database
const fetchInstallation = async (installQuery) => {
    const db = await mongo()
    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation lookup
        const result = await db.collection('tokens').findOne({ enterpriseId: installQuery.enterpriseId })
        return result.installation
    }
    if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        const result = await db.collection('tokens').findOne({ teamId: installQuery.teamId })
        result.installation.enterprise = {}
        return result.installation
    }
    throw new Error('Failed fetching installation')
}
// takes in an installQuery as an argument
// installQuery = {teamId: 'string', enterpriseId: 'string', userId: 'string', conversationId: 'string', isEnterpriseInstall: boolean};
// returns nothing
const deleteInstallation = async (installQuery) => {
    const db = await mongo()
    // replace myDB.get with your own database or OEM getter
    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation deletion
        return await db.collection('tokens').delete({ enterpriseId: installQuery.enterpriseId })
    }
    if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        return await db.collection('tokens').delete({ teamId: installQuery.teamId })
    }
    throw new Error('Failed to delete installation')
}

const installationStore = {
    storeInstallation,
    fetchInstallation,
    deleteInstallation,
}

module.exports = {
    installationStore,
    fetchInstallation,
}