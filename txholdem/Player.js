/* Texas Holdem Game Room Player */
class Player {

    constructor(id, name, money, avatar) {
        this.name = name;
        this.money = money;
        this.avatar = avatar;
        this.id = id;
    }

    getId = () => (this.id);
    setId = (id) => this.id(id);
    getName = () => (this.name);
    getMoney = () => (this.money);
    setMoney = (amount) => this.money(amount);
    getAvatar = () => (this.avatar);

}

module.exports = { Player }
