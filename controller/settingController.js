const WalletDBAccess = require("../db/wallet-db-access");
const { getMyTokensInWalletSOL, buyTokenSOL, validateTokenAddress, getSolBalanceSOL, isValidPublicKeySOL } = require("../services/solana");
const chalk = require("chalk");
const axios = require('axios');
const UI = require("../ui");
const SettingUI = require("../ui/settingUI");


const Red = (str) => console.log(chalk.bgRed(str));
const Yellow = (str) => console.log(chalk.bgYellow(str));
const Blue = (str) => console.log(chalk.bgBlue(str));
const Green = (str) => console.log(chalk.bgGreen(str));
const White = (str) => console.log(chalk.bgWhite(str));

const SettingController = {
    settingPage: async (bot, queryData) => {
        try {
            if (!queryData.message) {
                console.log('no queryData.message');
                return;
            }

            const chatId = queryData.message.chat.id;
            const messageId = queryData.message?.message_id;
            const findUserWallet = await WalletDBAccess.findWallet(chatId);

            const { title, button } = SettingUI.settingPage(findUserWallet);
            await UI.switchMenu(bot, chatId, messageId, title, button,);
        } catch (error) {
            Red(`referralPage ===> ${error}`);
        }
    },

    settingBuyAmountPage: async (bot, queryData) => {
        try {
            if (!queryData.message) {
                console.log('no queryData.message');
                return;
            }

            const chatId = queryData.message.chat.id;
            const messageId = queryData.message?.message_id;
            bot.sendMessage(chatId, `Enter the amount you want to BUY with for each COPY TRADING trade.

Example: 0.5 would mean you are buying each copy trading transaction with 0.5 SOL

Enter only the number, nothing else!`);
            bot.once(`message`, async (newMsg) => {
                const buyAmount = newMsg.text;
                if (buyAmount != Number(buyAmount)) {
                    bot.sendMessage(chatId, `🚫 Invalid buy budget, try again`)
                } else {
                    const updateResult = await WalletDBAccess.findOneAndUpdateWallet(chatId, { buyAmount });
                    if (!updateResult) {
                        bot.sendMessage(chatId, `Updeate failed.`)
                    }
                    else {
                        const findUserWallet = await WalletDBAccess.findWallet(chatId);
                        const { title, button } = SettingUI.settingPage(findUserWallet);
                        bot.sendMessage(chatId, title,
                            {
                                reply_markup: {
                                    inline_keyboard: button
                                }
                            }
                        );
                    }
                }
            })
        } catch (error) {
            Red(`settingBuyAmountPage ===> ${error}`);
        }
    },

    settingEditSlippagePage: async (bot, queryData) => {
        try {
            if (!queryData.message) {
                console.log('no queryData.message');
                return;
            }

            const chatId = queryData.message.chat.id;
            const messageId = queryData.message?.message_id;
            bot.sendMessage(chatId, `Enter your slippage below (in %)

Send only the number, with no percentage % sign

Example: 20

0 would mean no slippage`);
            bot.once(`message`, async (newMsg) => {
                const slippage = newMsg.text;
                if (slippage != Number(slippage)) {
                    bot.sendMessage(chatId, `🚫 Invalid slippage value, try again`)
                } else {
                    const updateResult = await WalletDBAccess.findOneAndUpdateWallet(chatId, { slippage });
                    if (!updateResult) {
                        bot.sendMessage(chatId, `Updeate failed.`)
                    }
                    else {
                        const findUserWallet = await WalletDBAccess.findWallet(chatId);
                        const { title, button } = SettingUI.settingPage(findUserWallet);
                        bot.sendMessage(chatId, title,
                            {
                                reply_markup: {
                                    inline_keyboard: button
                                }
                            }
                        );
                    }
                }
            })
        } catch (error) {
            Red(`settingEditSlippagePage     ===> ${error}`);
        }
    },
    settingEditJitoTipPage: async (bot, queryData) => {
        try {
            if (!queryData.message) {
                console.log('no queryData.message');
                return;
            }

            const chatId = queryData.message.chat.id;
            const messageId = queryData.message?.message_id;
            bot.sendMessage(chatId, `Enter your Jito Tip below.`);
            bot.once(`message`, async (newMsg) => {
                const jitoTip = newMsg.text;
                if (jitoTip != Number(jitoTip)) {
                    bot.sendMessage(chatId, `🚫 Invalid JitoTip value, try again`);
                    return;
                } else {
                    const updateResult = await WalletDBAccess.findOneAndUpdateWallet(chatId, { jitoTip });
                    if (!updateResult) {
                        bot.sendMessage(chatId, `Updeate failed.`)
                    }
                    else {
                        const findUserWallet = await WalletDBAccess.findWallet(chatId);
                        const { title, button } = SettingUI.settingPage(findUserWallet);
                        bot.sendMessage(chatId, title,
                            {
                                reply_markup: {
                                    inline_keyboard: button
                                }
                            }
                        );
                    }
                }
            })
        } catch (error) {
            Red(`settingEditSlippagePage     ===> ${error}`);
        }
    },

    settingSellTypeAllPage: async (bot, queryData) => {
        try {
            if (!queryData.message) {
                console.log('no queryData.message');
                return;
            }

            const chatId = queryData.message.chat.id;
            const messageId = queryData.message?.message_id;
            const findUserWallet = await WalletDBAccess.findWallet(chatId);
            if (findUserWallet.selltype == `all`) {
                return;
            }
            const updateResult = await WalletDBAccess.findOneAndUpdateWallet(chatId, { selltype: 'all' });
            if (!updateResult) {
                bot.sendMessage(chatId, `Updeate failed.`)
            }
            else {
                const newfindUserWallet = await WalletDBAccess.findWallet(chatId);
                const { title, button } = SettingUI.settingPage(newfindUserWallet);
                await UI.switchMenu(bot, chatId, messageId, title, button,);

            }
        } catch (error) {
            Red(`settingEditSlippagePage     ===> ${error}`);
        }
    },

    settingSellTypePercentPage: async (bot, queryData) => {
        try {
            if (!queryData.message) {
                console.log('no queryData.message');
                return;
            }

            const chatId = queryData.message.chat.id;
            const messageId = queryData.message?.message_id;
            const findUserWallet = await WalletDBAccess.findWallet(chatId);
            if (findUserWallet.selltype != `all`) {
                return;
            }
            bot.sendMessage(chatId, `Sell type changed to PERCENTAGEM

This sell type means that if the copy trader sells a certain amount of a token, you will copy that exact amount.

For example, if the copy trader sells 50% of their tokens, you will also copy that and sell 50% of your tokens.`);
            bot.once(`message`, async (newMsg) => {
                const percent = newMsg.text;
                if (percent != Number(percent)) {
                    bot.sendMessage(chatId, `🚫 Invalid sell percentage value, try again`)
                } else {
                    const updateResult = await WalletDBAccess.findOneAndUpdateWallet(chatId, { selltype: percent });
                    if (!updateResult) {
                        bot.sendMessage(chatId, `Updeate failed.`)
                    }
                    else {
                        const findUserWallet = await WalletDBAccess.findWallet(chatId);
                        const { title, button } = SettingUI.settingPage(findUserWallet);
                        await UI.switchMenu(bot, chatId, messageId, title, button,);
                    }
                }
            })
        } catch (error) {
            Red(`settingSellTypePercentPage     ===> ${error}`);
        }
    },

    settingEditStopLossPage: async (bot, queryData) => {
        try {
            if (!queryData.message) {
                console.log('no queryData.message');
                return;
            }

            const chatId = queryData.message.chat.id;
            const messageId = queryData.message?.message_id;
            bot.sendMessage(chatId, `📨 Send stop loss below`);
            bot.once(`message`, async (newMsg) => {
                const stopLoss = newMsg.text;
                if (stopLoss != Number(stopLoss)) {
                    bot.sendMessage(chatId, `🚫 Invalid sell stopLoss value, try again`)
                } else {
                    const updateResult = await WalletDBAccess.findOneAndUpdateWallet(chatId, { stopLoss });
                    if (!updateResult) {
                        bot.sendMessage(chatId, `Updeate failed.`)
                    }
                    else {
                        const findUserWallet = await WalletDBAccess.findWallet(chatId);
                        const { title, button } = SettingUI.settingPage(findUserWallet);
                        bot.sendMessage(chatId, title,
                            {
                                reply_markup: {
                                    inline_keyboard: button
                                }
                            }
                        );
                    }
                }
            })
        } catch (error) {
            Red(`settingSellTypePercentPage     ===> ${error}`);
        }
    },

    settingEditTakeProfitPage: async (bot, queryData) => {
        try {
            if (!queryData.message) {
                console.log('no queryData.message');
                return;
            }

            const chatId = queryData.message.chat.id;
            const messageId = queryData.message?.message_id;
            bot.sendMessage(chatId, `📨 Send take profit below`);
            bot.once(`message`, async (newMsg) => {
                const takeProfit = newMsg.text;
                if (takeProfit != Number(takeProfit)) {
                    bot.sendMessage(chatId, `🚫 Invalid sell takeProfit value, try again`)
                } else {
                    const updateResult = await WalletDBAccess.findOneAndUpdateWallet(chatId, { takeProfit });
                    if (!updateResult) {
                        bot.sendMessage(chatId, `Updeate failed.`)
                    }
                    else {
                        const findUserWallet = await WalletDBAccess.findWallet(chatId);
                        const { title, button } = SettingUI.settingPage(findUserWallet);
                        await UI.switchMenu(bot, chatId, messageId, title, button,);
                    }
                }
            })
        } catch (error) {
            Red(`settingSellTypePercentPage     ===> ${error}`);
        }
    },


}

module.exports = SettingController;