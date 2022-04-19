/* Player class */
class Player {

    constructor(id, name, money, avatar, status) {
        this.name = name;
        this.money = money;
        this.avatar = avatar;
        this.id = id;
        this.status = status;
    }

    getId = () => (this.id);
    setId = (id) => this.id(id);
    getName = () => (this.name);
    getMoney = () => (this.money);
    setMoney = (amount) => this.money(amount);
    getAvatar = () => (this.avatar);

}

module.exports = { Player }
