import { findAchievementsByChatId } from "../models/user_achievements.js";

const updateAchievements = async (chatID) => {
    const achievements = await findAchievementsByChatId(chatID);
    console.log(achievements);
}


export default updateAchievements;