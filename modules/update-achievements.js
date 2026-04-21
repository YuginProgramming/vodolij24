import { findAchievementsByChatId } from "../models/user_achievements";

const updateAchievements = async (chatID) => {
  const achievements = await findAchievementsByChatId(chatID);
};

export default updateAchievements;
