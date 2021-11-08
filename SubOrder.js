const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  SIZE: Symbol("size"),
  TOPPINGS: Symbol("toppings"),
  DRINKS: Symbol("drinks"),
  COOKIES: Symbol("cookies"),
  FRIES: Symbol("fries"),
  PAYMENT: Symbol("payment")
});

module.exports = class SubOrder extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sSize = "";
    this.sToppings = "";
    this.sDrinks = "";
    this.sCookies = "";
    this.sItem = "";
    this.sFries = "";
  }
  handleInput(sInput) {
    let aReturn = [];
    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.Item;
        aReturn.push("Welcome to Sub House.");
        aReturn.push("What would you like to have today, Sub or Grilled Wrap");
        break;
      case OrderState.Item:
        //error handling for item
        if (sInput.toLowerCase() == "sub" || sInput.toLowerCase() == "wrap") {
          this.stateCur = OrderState.SIZE
          this.sItem = sInput;
          aReturn.push("What size would you like?");
        } else {
          aReturn.push("please enter sub or wrap");
        }
        break;

      case OrderState.SIZE:
        //error handling for size
        if (this.sItem == "sub" && (sInput.toLowerCase() == "6inch" || sInput.toLowerCase() == "foot-long")) {
          this.stateCur = OrderState.TOPPINGS
          this.sSize = sInput;
          aReturn.push("What toppings would you like?");
        } else if (this.sItem == "wrap" && (sInput.toLowerCase() == "regular" || sInput.toLowerCase() == "large")) {
          this.stateCur = OrderState.TOPPINGS
          this.sSize = sInput;
          aReturn.push("What toppings would you like?");
        } else {
          aReturn.push("Please enter 6inch or foot-long for sub, and regular or large for wrap");
        }
        break;
      case OrderState.TOPPINGS:
        this.stateCur = OrderState.FRIES
        this.sToppings = sInput;
        aReturn.push(`What would you like to add with ${this.sItem}? , fries or potato wedges`);
        break;

      case OrderState.FRIES:
        //error handling for second item
        if (sInput.toLowerCase() == "fries" || sInput.toLowerCase() == "wedges") {
          this.stateCur = OrderState.DRINKS
          this.sFries = sInput;
          aReturn.push(`What drink Would you like to add with ?`);
        } else {
          aReturn.push("please enter fries or wedges");
        }
        break;
      case OrderState.DRINKS:
        this.stateCur = OrderState.COOKIES
        this.sDrinks = sInput;
        aReturn.push("Would you like add cookies with that?");
        break;

      case OrderState.COOKIES:
        this.stateCur = OrderState.PAYMENT;
        this.nOrder = 15;
        if (sInput.toLowerCase() != "no") {
          this.sCookies = sInput;
        }

        aReturn.push("Thank-you for your order of");
        this.nTotal = 0;
        if (this.sItem == "sub" && (this.sFries == "potato wedges" || this.sFries == "wedges" || this.sFries == "fries")) {
          this.nTotal += 8.99;
          aReturn.push(`${this.sSize} ${this.sItem} adding ${this.sFries} with ${this.sToppings} and ${this.sDrinks}`);
        } else if (this.sItem == "wrap" && (this.sFries == "potato wedges" || this.sFries == "wedges" || this.sFries == "fries")) {
          this.nTotal += 9.99
          aReturn.push(`${this.sSize} ${this.sItem} adding ${this.sFries} with ${this.sToppings} and ${this.sDrinks}`);
        }
        if (this.sCookies) {
          aReturn.push(`and two cookies`);
        }
        aReturn.push(`Your total comes to ${this.nTotal} including tax`);
        aReturn.push(`Please pay for your order here`);
        aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        break;

      case OrderState.PAYMENT:
        console.log(sInput);
        this.isDone(true);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 20);
        aReturn.push(`Your order will be delivered at ${d.toTimeString()}`);
        break;
    }
    return aReturn;
  }
  renderForm(sTitle = "-1", sAmount = "-1") {
    // your client id should be kept private
    if (sTitle != "-1") {
      this.sItem = sTitle;
    }
    if (sAmount != "-1") {
      this.nOrder = sAmount;
    }
    const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
    return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nTotal}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nTotal}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

  }
}