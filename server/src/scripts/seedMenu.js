require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");
const { MenuCategory, MenuItem } = require("../models/menu.model");
const Restaurant = require("../models/restaurant");

// 52 Categories with 10+ delicious items each (520+ items total)
const MENU_DATA = [
  {
    name: "Classic Pizzas",
    description: "Traditional stone-baked pizzas with hand-stretched dough and rich mozzarella.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Margherita Classico", description: "San Marzano tomato sauce, fresh buffalo mozzarella, basil, and extra virgin olive oil.", price: 299, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80" },
      { name: "Double Cheese Margherita", description: "Loaded with double layer of molten mozzarella and aged parmesan.", price: 349, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80" },
      { name: "Farmhouse Veggie Delight", description: "Crunchy bell peppers, red onions, mushrooms, juicy tomatoes, and sweet corn.", price: 379, image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&auto=format&fit=crop&q=80" },
      { name: "Spicy Pepperoni Feast", description: "Zesty pepperoni slices layered generously over melted mozzarella and chili flakes.", price: 449, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80" },
      { name: "Paneer Tikka Pizza", description: "Spicy marinated paneer cubes, roasted bell peppers, coriander, and tandoori sauce.", price: 399, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80" },
      { name: "Hawaiian Sunshine", description: "Grilled pineapple chunks, sliced jalapeños, sweet corn, and mozzarella cheese.", price: 369, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80" },
      { name: "Mushroom & Truffle Oil Pizza", description: "Wild sautéed button mushrooms, caramelized onions, thyme, and aromatic truffle oil drizzle.", price: 499, image: "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=600&auto=format&fit=crop&q=80" },
      { name: "Spicy Mexican Fiery Pizza", description: "Black olives, jalapeños, crushed nachos, Mexican salsa, and chipotle crema.", price: 419, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80" },
      { name: "Four Cheese Quattro Formaggi", description: "A rich blend of Mozzarella, Cheddar, Gorgonzola, and freshly grated Parmesan.", price: 479, image: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&auto=format&fit=crop&q=80" },
      { name: "BBQ Smoked Paneer Pizza", description: "Smoky barbecue marinated paneer, red onions, smoked paprika, and mozzarella.", price: 429, image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&auto=format&fit=crop&q=80" }
    ]
  },
  {
    name: "Gourmet & Woodfired Pizzas",
    description: "Artisanal crusts baked at 400°C woodfired ovens with imported gourmet toppings.",
    image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Burrata & Pesto Neapolitan", description: "Artisan basil pesto base topped with a whole creamy burrata ball and pine nuts.", price: 549, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80" },
      { name: "Roasted Garlic & Sun-Dried Tomato", description: "Confit garlic cloves, Italian sun-dried tomatoes, capers, and fresh rosemary.", price: 469, image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80" },
      { name: "Wild Forest Mushroom Bianco", description: "White sauce base, porcini & button mushrooms, fontina cheese, and fresh microgreens.", price: 529, image: "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=600&auto=format&fit=crop&q=80" },
      { name: "Artichoke & Kalamata Olive Rustica", description: "Marinated artichoke hearts, Greek Kalamata olives, feta crumbles, and oregano.", price: 489, image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&auto=format&fit=crop&q=80" },
      { name: "Smoked Scamorza & Bell Pepper", description: "Smoked Italian scamorza cheese, fire-roasted sweet peppers, and chili infused oil.", price: 499, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80" },
      { name: "Spicy Arrabbiata Woodfired Pizza", description: "Fiery crushed red pepper marinara, charred baby corn, bell peppers, and fresh herbs.", price: 439, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80" },
      { name: "Gorgonzola & Caramelized Fig", description: "Sweet slow-cooked fig compote, tangy gorgonzola cheese, walnuts, and balsamic reduction.", price: 569, image: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&auto=format&fit=crop&q=80" },
      { name: "Avocado & Cherry Tomato Sourdough", description: "Sourdough crust, fresh Haas avocado slices, blistered cherry tomatoes, and arugula.", price: 519, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80" },
      { name: "Truffle Ricotta & Spinach Calzone", description: "Folded woodfired pizza stuffed with seasoned ricotta, sautéed spinach, and truffle essence.", price: 479, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80" },
      { name: "Primavera Green Garden", description: "Zucchini ribbons, asparagus tips, green peas, mint oil, and buffalo mozzarella.", price: 489, image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&auto=format&fit=crop&q=80" }
    ]
  },
  {
    name: "Artisanal Burgers",
    description: "Juicy handcrafted patties nestled in toasted brioche buns with signature sauces.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Crispy Peri-Peri Paneer Burger", description: "Crunchy peri-peri crusted paneer patty, garlic aioli, iceberg lettuce, and cheese slice.", price: 189, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80" },
      { name: "Double Decker Cheese Monster", description: "Two vegetable crisp patties, double cheddar cheese, caramelized onions, and house sauce.", price: 239, image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80" },
      { name: "Smoky BBQ Veggie Beast", description: "Char-grilled mixed vegetable & bean patty drenched in hickory barbecue sauce with gherkins.", price: 199, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80" },
      { name: "Spicy Chipotle Black Bean Burger", description: "Mexican spiced black bean patty, guacamole, jalapeños, and pepper jack cheese.", price: 219, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&auto=format&fit=crop&q=80" },
      { name: "Mushroom Melt Swiss Burger", description: "Butter-basted portobello mushroom, melted Swiss cheese, dijonnaise on brioche.", price: 249, image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&auto=format&fit=crop&q=80" },
      { name: "Classic Aloo Tikki Royale", description: "Spiced potato & pea patty, sweet tamarind relish, mint chutney, and crunchy onion rings.", price: 129, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80" },
      { name: "Tandoori Paneer Sliders (3 Pcs)", description: "Trio of mini burgers stuffed with tandoori paneer, pickled onions, and mint mayo.", price: 269, image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&auto=format&fit=crop&q=80" },
      { name: "Avocado & Beetroot Protein Burger", description: "Nutrient-packed beetroot quinoa patty with sliced fresh avocado and hummus spread.", price: 259, image: "https://images.unsplash.com/photo-1583032015879-c564c785e0df?w=600&auto=format&fit=crop&q=80" },
      { name: "Korean Sweet & Spicy Crunch Burger", description: "Gochujang glazed crispy tofu patty, sesame slaw, and spicy mayo on toasted brioche.", price: 229, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80" },
      { name: "Cheesy Jalapeño Popper Burger", description: "Crisp potato patty stuffed with molten cheese and spicy jalapeño bits.", price: 209, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80" }
    ]
  },
  {
    name: "Sandwiches & Paninis",
    description: "Grilled, toasted, and cold pressed gourmet sandwiches made with freshly baked sourdough and focaccia.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Classic Bombay Grilled Sandwich", description: "Layered potatoes, cucumbers, tomatoes, bell peppers, spicy mint chutney, and melted cheese.", price: 159, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80" },
      { name: "Paneer Tikka Panini", description: "Spiced paneer cubes, roasted onions, mint yogurt spread pressed in Italian panini bread.", price: 199, image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80" },
      { name: "Triple Decker Club Sandwich", description: "Three toasted bread slices stacked with coleslaw, cheese, grilled veggies, and fries.", price: 229, image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&auto=format&fit=crop&q=80" },
      { name: "Spinach, Corn & Cheese Melt", description: "Creamy corn and baby spinach blend covered in molten cheddar on sourdough.", price: 179, image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&auto=format&fit=crop&q=80" },
      { name: "Pesto Mozzarella Focaccia", description: "Basil pesto, fresh bocconcini mozzarella, Roma tomatoes on herb focaccia bread.", price: 249, image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80" },
      { name: "Mexican Guacamole Toast", description: "Chunky seasoned avocado guacamole on garlic sourdough with salsa and pumpkin seeds.", price: 239, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80" },
      { name: "Mushroom & Caramelized Onion Panini", description: "Balsamic glazed mushrooms, sweet caramelized onions, and provolone cheese.", price: 219, image: "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=600&auto=format&fit=crop&q=80" },
      { name: "Nutella & Banana French Toast", description: "Golden pan-fried brioche stuffed with melted Nutella hazelnut spread and fresh bananas.", price: 199, image: "https://images.unsplash.com/photo-1484723091739-004a62725e2e?w=600&auto=format&fit=crop&q=80" },
      { name: "Tandoori Coleslaw Footlong", description: "Footlong baguette stuffed with tandoori mayo coleslaw, lettuce, and cheese.", price: 189, image: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=600&auto=format&fit=crop&q=80" },
      { name: "Chili Cheese Toast (4 Pcs)", description: "Crispy toast topped with spiced green chilies, bell peppers, and bubbling cheese.", price: 149, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80" }
    ]
  },
  {
    name: "Authentic Pasta & Risotto",
    description: "Al dente Italian pastas and slow-simmered arborio rice with rich herbs and cheeses.",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Penne Arrabbiata", description: "Penne pasta in spicy garlic tomato sauce with black olives and freshly grated parmesan.", price: 279, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80" },
      { name: "Fettuccine Alfredo", description: "Silky fettuccine ribbons tossed in rich butter, heavy cream, garlic, and aged parmesan.", price: 329, image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80" },
      { name: "Spaghetti Aglio e Olio", description: "Classic spaghetti with extra virgin olive oil, sautéed garlic slices, chili flakes, and parsley.", price: 299, image: "https://images.unsplash.com/photo-1556760544-74068565f05c?w=600&auto=format&fit=crop&q=80" },
      { name: "Creamy Pink Sauce Fusilli", description: "Fusilli pasta in a harmonious blend of tomato marinara and rich parmesan cream sauce.", price: 319, image: "https://images.unsplash.com/photo-1621996346565-e3d5d628109d?w=600&auto=format&fit=crop&q=80" },
      { name: "Genovese Basil Pesto Farfalle", description: "Bowtie pasta coated in aromatic crushed basil pesto, roasted pine nuts, and cherry tomatoes.", price: 349, image: "https://images.unsplash.com/photo-1516100882582-76c9a3ca2f18?w=600&auto=format&fit=crop&q=80" },
      { name: "Four Cheese Macaroni Bake", description: "Oven-baked macaroni in a creamy four-cheese sauce with golden crispy herb crust.", price: 339, image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80" },
      { name: "Wild Mushroom Arborio Risotto", description: "Slow-cooked Italian arborio rice with porcini mushrooms, white wine, and butter.", price: 379, image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80" },
      { name: "Spinach & Ricotta Ravioli", description: "Handmade pasta parcels stuffed with ricotta and spinach in velvety sage butter sauce.", price: 389, image: "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600&auto=format&fit=crop&q=80" },
      { name: "Lasagna Primavera Rustica", description: "Layered pasta sheets with seasoned garden vegetables, béchamel, marinara, and mozzarella.", price: 369, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80" },
      { name: "Sun-Dried Tomato & Saffron Risotto", description: "Fragrant saffron infused risotto with tangy sun-dried tomatoes and shaved parmesan.", price: 399, image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80" }
    ]
  },
  {
    name: "Tandoori & Kebabs",
    description: "Charcoal-grilled succulent starters marinated in yogurt and aromatic whole Indian spices.",
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Paneer Tikka Shashlik", description: "Cubes of paneer, bell peppers, and onions skewered and cooked over clay tandoor.", price: 299, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80" },
      { name: "Malai Paneer Tikka", description: "Paneer cubes marinated in rich clotted cream, cashew paste, cardamom, and gentle spices.", price: 329, image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80" },
      { name: "Achari Paneer Tikka", description: "Tangy pickled spiced paneer roasted to perfection with mustard seeds and fenugreek.", price: 309, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80" },
      { name: "Dahi Ke Kebab (6 Pcs)", description: "Crisp golden patties made with hung curd, green chilies, coriander, and crushed spices.", price: 269, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Hara Bhara Kebab (6 Pcs)", description: "Pan-fried patties made of spinach, green peas, potatoes, and topped with cashew nut.", price: 239, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" },
      { name: "Tandoori Stuffed Mushroom", description: "Button mushrooms stuffed with spiced cheese and spinach, chargrilled in tandoor.", price: 289, image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80" },
      { name: "Tandoori Soya Chaap", description: "Protein-rich soya chaap marinated in spiced tandoori masala and grilled to tenderness.", price: 259, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Malai Soya Chaap", description: "Tender soya chaap in creamy cashew marinade with white pepper and butter glaze.", price: 279, image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80" },
      { name: "Corn & Cheese Seekh Kebab", description: "Minced sweet corn and cottage cheese skewered with fresh herbs and roasted.", price: 279, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" },
      { name: "DineOps Grand Kebab Platter", description: "Assorted platter containing Paneer Tikka, Malai Chaap, Dahi Kebab, and Stuffed Mushrooms.", price: 499, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80" }
    ]
  },
  {
    name: "Paneer Specialties",
    description: "Exquisite cottage cheese preparations cooked in rich gravies and authentic Indian spices.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Paneer Butter Masala", description: "Soft paneer cubes simmered in a silky tomato, cashew, and butter makhani gravy.", price: 319, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80" },
      { name: "Kadai Paneer", description: "Paneer tossed with bell peppers and onions in a freshly ground coriander and red chili masala.", price: 309, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Palak Paneer", description: "Cottage cheese cubes bathed in smooth, garlic-tempered pureed spinach gravy.", price: 299, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80" },
      { name: "Shahi Paneer Royale", description: "Royal Mughlai dish of paneer in a sweet, aromatic white cashew and saffron gravy.", price: 339, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
      { name: "Paneer Tikka Masala", description: "Charcoal grilled paneer tikka pieces cooked in a smoky, spicy onion tomato gravy.", price: 349, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80" },
      { name: "Paneer Lababdar", description: "Grated and cubed paneer cooked in a rich, chunky tomato-onion gravy finished with cream.", price: 329, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Paneer Bhurji Gravy", description: "Scrambled fresh paneer tossed with tomatoes, onions, green chilies, and coriander.", price: 289, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
      { name: "Paneer Pasanda", description: "Stuffed paneer triangles in a mildly spiced almond and poppy seed gravy.", price: 359, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80" },
      { name: "Paneer Do Pyaza", description: "Double onion preparation with shallots and caramelized onions in spiced gravy.", price: 309, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80" },
      { name: "Handi Paneer Dum", description: "Slow-cooked paneer in a clay pot with whole garam masalas and aromatic ghee.", price: 349, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" }
    ]
  },
  {
    name: "North Indian Curries & Gravies",
    description: "Hearty, slow-cooked North Indian main courses prepared with authentic desi ghee and spices.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Dum Aloo Kashmiri", description: "Baby potatoes slow cooked in a rich, sweet and spicy yogurt gravy with fennel and dry ginger.", price: 249, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
      { name: "Malai Kofta Royale", description: "Melt-in-mouth cottage cheese and potato dumplings in a velvety cashew and saffron sauce.", price: 319, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80" },
      { name: "Navratan Korma", description: "A royal sweet and savory curry made with nine gemstones of vegetables, fruits, and nuts.", price: 329, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" },
      { name: "Veg Kolhapuri Extra Spicy", description: "Maharashtrian style fiery curry packed with mixed seasonal veggies and roasted sesame masala.", price: 279, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Kaju Curry (Cashew Masala)", description: "Whole roasted cashews cooked in a luscious spiced onion-tomato gravy.", price: 369, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80" },
      { name: "Methi Matar Malai", description: "Fresh fenugreek leaves and sweet green peas simmered in rich creamy white gravy.", price: 299, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
      { name: "Pindi Chole Masala", description: "Authentic Rawalpindi style chickpeas cooked in dry pomegranate seeds and whole spices.", price: 239, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" },
      { name: "Mix Vegetable Jalfrezi", description: "Crisp stir-fried garden vegetables tossed with onions, peppers in a tangy tomato masala.", price: 269, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Baingan Bharta (Smoked Eggplant)", description: "Clay-oven roasted eggplant mashed and cooked with garlic, onions, tomatoes, and mustard oil.", price: 249, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80" },
      { name: "Mushroom Do Pyaza", description: "Tender button mushrooms cooked with pearl onions in spiced thick masala.", price: 289, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80" }
    ]
  },
  {
    name: "Dal & Lentil Delights",
    description: "Comforting Indian lentils slow cooked over charcoal with authentic tadka temperings.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Dal Makhani (24-Hour Simmered)", description: "Whole black lentils and kidney beans slow-simmered overnight with butter, cream, and garlic.", price: 269, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" },
      { name: "Dal Tadka Desi Ghee", description: "Yellow lentils tempered with double tadka of cumin seeds, garlic, red chilies, and pure ghee.", price: 219, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
      { name: "Dal Fry Punjabi Style", description: "Creamy cooked toor dal pan-fried with onions, tomatoes, ginger, and fresh green coriander.", price: 199, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Dhaba Style Lasooni Dal", description: "Yellow lentils loaded with burnt garlic tadka, green chilies, and hing (asafoetida).", price: 229, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" },
      { name: "Panchmel Dal (5 Lentil Blend)", description: "Traditional Rajasthani 5-lentil mixture cooked with aromatic spices and ghee.", price: 249, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
      { name: "Dal Palak Healthy", description: "Nutrition packed yellow lentils cooked together with fresh spinach and cumin tempering.", price: 219, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80" },
      { name: "Amritsari Chana Dal", description: "Split Bengal gram cooked in rich Punjabi spices, ginger juliennes, and kasuri methi.", price: 229, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Dal Moradabadi", description: "Moong dal cooked silky smooth and served with crunchy papad, butter, and chaat masala.", price: 209, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" },
      { name: "Smoky Charcoal Dal Tadka", description: "Dungar infused yellow dal giving an irresistible smoky woodfire aroma.", price: 239, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
      { name: "Gujarati Sweet & Sour Dal", description: "Traditional toor dal balanced with jaggery, kokum, peanuts, and curry leaf tadka.", price: 219, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" }
    ]
  },
  {
    name: "Biryanis & Pulao",
    description: "Long grain Basmati rice dum-cooked with saffron, rose water, and whole spices.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Hyderabadi Dum Veg Biryani", description: "Aromatic basmati rice layered with spiced vegetables, saffron, mint, and fried onions (served with raita).", price: 299, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80" },
      { name: "Paneer Tikka Dum Biryani", description: "Char-grilled paneer tikka tossed with basmati rice, mint, brown onions, and kewra water.", price: 329, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
      { name: "Lucknowi Nawabi Biryani", description: "Subtly spiced Awadhi style dum biryani with cottage cheese, green cardamom, and dry fruits.", price: 349, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80" },
      { name: "Kolkata Veg Biryani (with Potato)", description: "Fragrant rice cooked with spiced whole potatoes, saffron milk, and aromatic spices.", price: 279, image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80" },
      { name: "Matka Dum Biryani", description: "Slow-baked inside a sealed earthenware pot for an earthy aroma and rich flavour.", price: 359, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80" },
      { name: "Kashmiri Dry Fruit Pulao", description: "Sweet and fragrant basmati rice loaded with fried cashews, almonds, raisins, and pomegranate.", price: 289, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
      { name: "Jeera Rice Desi Ghee", description: "Fluffy basmati rice tempered with roasted cumin seeds and fresh ghee.", price: 169, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" },
      { name: "Peas & Corn Pulao", description: "Steamed basmati rice cooked with tender green peas, sweet corn, and mild whole spices.", price: 189, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80" },
      { name: "Curd Rice South Indian", description: "Cooling tempered rice mixed with fresh creamy yogurt, mustard seeds, ginger, and curry leaves.", price: 179, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80" },
      { name: "Soya Chaap Biryani", description: "Juicy marinated soya chaap pieces cooked in spiced saffron basmati rice.", price: 289, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80" }
    ]
  },
  {
    name: "Fresh Indian Breads (Naan & Roti)",
    description: "Tandoor-baked flatbreads, flaky parathas, and stuffed kulchas.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    items: [
      { name: "Butter Garlic Naan", description: "Leavened refined flour bread brushed with butter and minced roasted garlic.", price: 79, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Cheese Garlic Naan", description: "Stuffed with molten mozzarella and cheddar, topped with garlic butter and herbs.", price: 129, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80" },
      { name: "Amritsari Aloo Kulcha", description: "Crisp flaky tandoori kulcha stuffed with spiced mashed potatoes and pomegranate powder.", price: 119, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Paneer Stuffed Kulcha", description: "Tandoori bread stuffed with seasoned grated cottage cheese, green chilies, and coriander.", price: 139, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80" },
      { name: "Lachha Paratha Desi Ghee", description: "Multi-layered whole wheat bread cooked in tandoor and brushed with clarified butter.", price: 69, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Pudina (Mint) Paratha", description: "Flaky whole wheat paratha coated with dried aromatic mint powder and butter.", price: 79, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Tandoori Butter Roti", description: "Whole wheat flatbread baked inside charcoal tandoor and brushed with butter.", price: 35, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
      { name: "Missi Roti (Gram Flour)", description: "Traditional gram flour and wheat bread flavored with ajwain and fenugreek leaves.", price: 59, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" },
      { name: "Chili Garlic Naan", description: "Spicy variation of garlic naan topped with chopped green chilies and coriander.", price: 89, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80" },
      { name: "DineOps Assorted Bread Basket", description: "Basket containing 1 Butter Naan, 1 Garlic Naan, 1 Lachha Paratha, and 1 Missi Roti.", price: 249, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80" }
    ]
  }
];

// Helper to expand with more categories
const EXTRA_CATEGORIES = [
  { name: "South Indian Dosas & Uttpams", desc: "Crispy fermented crepes & thick pancakes", img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80", items: ["Plain Crispy Dosa", "Masala Butter Dosa", "Mysore Masala Dosa", "Cheese Burst Dosa", "Rava Onion Dosa", "Paneer Tikka Dosa", "Schezwan Noodle Dosa", "Onion Tomato Uttapam", "Mixed Veggie Uttapam", "Podi Ghee Dosa"] },
  { name: "Idli, Vada & Sambar", desc: "Steamed rice cakes, crispy lentil donuts & piping hot sambar", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80", items: ["Steamed Idli (2 Pcs)", "Medu Vada (2 Pcs)", "Ghee Podi Button Idlis", "Dahi Vada South Style", "Fried Idli Chaat", "Rava Idli with Coconut Chutney", "Kanchipuram Spiced Idli", "Sambar Vada Dip", "Mini Tiffin Combo", "Idli Vada Mix Platter"] },
  { name: "Indo-Chinese Starters", desc: "Wok tossed crunchy appetizers with garlic and soya glazes", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80", items: ["Chili Paneer Dry", "Veg Manchurian Dry", "Crispy Honey Chili Potato", "Spring Rolls (6 Pcs)", "Crispy Corn Pepper Salt", "Mushroom Chili Dry", "Veg Schezwan Wontons", "Golden Fried Baby Corn", "Dragon Paneer Bites", "Chinese Bhel Crispy"] },
  { name: "Noodles & Fried Rice", desc: "Wok-fried hakka noodles and fragrant jasmine fried rice", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80", items: ["Veg Hakka Noodles", "Schezwan Chili Noodles", "Chili Garlic Noodles", "Burnt Garlic Fried Rice", "Triple Schezwan Rice", "Singapore Street Noodles", "American Chopsuey", "Pan Fried Noodles in Gravy", "Kimchi Fried Rice", "Wok Tossed Mushroom Noodles"] },
  { name: "Dim Sum & Dumplings", desc: "Delicate steamed and pan-fried Asian dumplings", img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80", items: ["Steamed Veg Dim Sum (6 Pcs)", "Crystal Truffle Edamame Dim Sum", "Spicy Cottage Cheese Bao (2 Pcs)", "Pan Fried Gyoza Dumplings", "Broccoli & Water Chestnut Dim Sum", "Schezwan Dim Sum in Chili Oil", "Cheese & Corn Steamed Momos", "Crispy Fried Momos", "Tandoori Momos (6 Pcs)", "Asian Dim Sum Assorted Basket"] },
  { name: "Asian Soups & Bowls", desc: "Comforting hot broths, ramens, and sour soups", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80", items: ["Hot & Sour Soup", "Sweet Corn Veg Soup", "Manchow Soup with Crispy Noodles", "Lemon Coriander Soup", "Tom Yum Thai Soup", "Vegetable Miso Ramen Bowl", "Wonton Clear Broth", "Burmese Khow Suey Bowl", "Coconut Galangal Soup", "Spicy Ramen Noodle Bowl"] },
  { name: "Mexican Tacos & Quesadillas", desc: "Crisp corn shells and folded tortillas packed with salsa and cheese", img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80", items: ["Crispy Bean & Corn Tacos", "Paneer Fajita Soft Tacos", "Three Cheese Quesadilla", "Mushroom & Jalapeño Quesadilla", "Guacamole Taco Trio", "Mexican Loaded Taquitos", "Chipotle Cottage Cheese Taco", "Avocado Ranch Taco", "Grilled Vegetable Quesadilla", "Fiesta Taco Platter"] },
  { name: "Burritos & Enchiladas", desc: "Stuffed flour tortillas baked with enchilada gravy and sour cream", img: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80", items: ["Classic Mexican Veg Burrito", "Chipotle Paneer Burrito Bowl", "Baked Cheese Enchiladas (2 Pcs)", "Black Bean Chimichanga", "California Avocado Burrito", "Spicy Jalapeño Enchilada", "Fajita Rice Burrito Wrap", "Mexican Rice & Bean Bowl", "Tostada Grande Salad Bowl", "Sizzling Fajita Skillet"] },
  { name: "Sizzlers & Platters", desc: "Sizzling hot platters served over smoking cast-iron plates", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80", items: ["DineOps Signature Veg Sizzler", "Paneer Shashlik Sizzler", "Italian Pasta & Herb Sizzler", "Mexican Bean & Rice Sizzler", "Chinese Hakka Noodle Sizzler", "Spicy Peri-Peri Sizzler", "Grilled Vegetable & Mash Sizzler", "Barbecue Cottage Cheese Sizzler", "Tandoori Fusion Sizzler", "Mushroom Pepper Sizzler"] },
  { name: "Fresh Salads & Power Bowls", desc: "Garden-fresh crispy greens, grains, and artisan dressings", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80", items: ["Classic Caesar Salad with Croutons", "Greek Salad with Feta & Olives", "Quinoa Avocado Protein Bowl", "Burrata Caprese Salad", "Crispy Asian Noodle Salad", "Mexican Fiesta Bean Salad", "Watermelon & Mint Feta Salad", "Roasted Beetroot & Walnut Salad", "Falafel & Hummus Power Bowl", "Fresh Garden Green Salad"] },
  { name: "Hot Soups & Broths", desc: "Slow-simmered aromatic European and Indian broths", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80", items: ["Cream of Tomato with Herb Croutons", "Roasted Garlic Mushroom Soup", "Minestrone Italiano", "Cream of Broccoli & Almond", "French Onion Soup with Cheese Toast", "Sweet Potato Coconut Chowder", "Sweet Corn Vegetable Soup", "Lemon Coriander Broth", "Roasted Pumpkin & Thyme Soup", "Cream of Wild Celery Soup"] },
  { name: "Crispy Snacks & Finger Food", desc: "Golden fried bar bites, french fries, and appetizers", img: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80", items: ["Classic Salted French Fries", "Peri-Peri Masala Fries", "Loaded Cheesy Truffle Fries", "Crispy Mozzarella Sticks (6 Pcs)", "Cheesy Jalapeño Poppers", "Crispy Onion Rings Basket", "Veggie Nuggets with Dip (8 Pcs)", "Corn & Cheese Balls (6 Pcs)", "Garlic Potato Wedges", "DineOps Party Snack Platter"] },
  { name: "Chaat & Street Food Specials", desc: "Authentic Indian sweet, tangy, and crunchy street delicacies", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80", items: ["Pani Puri (6 Pcs with 2 Waters)", "Dahi Puri Sev Batata (6 Pcs)", "Crispy Sev Puri", "Papdi Chaat with Sweet Curd", "Aloo Tikki Chole Chaat", "Bombay Bhel Puri", "Raj Kachori Royale", "Samosa Chaat with Chole", "Dahi Vada Chaat with Tamarind", "Palak Patta Crispy Chaat"] },
  { name: "Rolls, Wraps & Frankies", desc: "Flaky griddle flatbreads rolled with spiced fillings and sauces", img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80", items: ["Kolkata Paneer Kathi Roll", "Spicy Veg Frankie Roll", "Schezwan Cheese Roll", "Falafel & Tahini Wrap", "Mexican Burrito Wrap", "Tandoori Soya Chaap Roll", "Mushroom Tikka Kathi Roll", "Cheesy Aloo Corn Roll", "Chili Paneer Spring Wrap", "Double Cheese Paneer Roll"] },
  { name: "Garlic Breads & Bruschettas", desc: "Oven-toasted French baguettes with herbed garlic butter and toppings", img: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=80", items: ["Classic Butter Garlic Bread (4 Pcs)", "Cheese Garlic Bread (4 Pcs)", "Supreme Garlic Bread with Jalapeños", "Classic Tomato Basil Bruschetta", "Mushroom & Mozzarella Bruschetta", "Pesto Bocconcini Bruschetta", "Spicy Corn & Cheese Garlic Bread", "Avocado Garlic Toast", "Stuffed Garlic Bread Loaf", "Cheese Fondue with Garlic Bread Sticks"] },
  { name: "Continental Mains & Grills", desc: "European style roasted and baked hearty vegetarian mains", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80", items: ["Vegetable Au Gratin", "Grilled Cottage Cheese Steak", "Stuffed Roasted Bell Peppers", "Eggplant Parmigiana", "Creamy Polenta with Wild Mushrooms", "Spinach Corn Casserole", "Herb Roasted Baby Potatoes & Greens", "Vegetable Shepherd's Pie", "Ratatouille Provencal", "Baked Macaroni with Corn & Herbs"] },
  { name: "Thai Curries & Fragrant Rice", desc: "Authentic lemongrass, kaffir lime, and coconut milk curries", img: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=80", items: ["Thai Green Curry with Jasmine Rice", "Thai Red Curry with Jasmine Rice", "Yellow Massaman Curry Bowl", "Pad Thai Noodles with Peanuts", "Thai Basil Fried Rice", "Som Tum Green Papaya Salad", "Crispy Tofu with Sweet Chili Glaze", "Tom Kha Coconut Soup", "Thai Pineapple Fried Rice", "Stir-fried Asian Greens in Garlic"] },
  { name: "Middle Eastern & Mezze", desc: "Creamy hummus dips, fresh pita bread, and Mediterranean bites", img: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80", items: ["Classic Hummus with Warm Pita", "Peri-Peri Spicy Hummus Platter", "Baba Ganoush (Smoked Eggplant Dip)", "Tzatziki with Cucumber & Garlic", "Crispy Falafel with Tahini (6 Pcs)", "Muhammara Walnut Red Pepper Dip", "Tabbouleh Herb Salad", "Mediterranean Mezze Grand Platter", "Stuffed Grape Vine Leaves", "Grilled Halloumi Cheese with Olives"] },
  { name: "Shawarma & Pita Pockets", desc: "Warm fluffy pita bread stuffed with falafel, paneer, and garlic toum", img: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600&auto=format&fit=crop&q=80", items: ["Falafel Shawarma Roll", "Grilled Paneer Shawarma Roll", "Mushroom & Hummus Pita Pocket", "Spicy Harissa Cottage Cheese Pocket", "Open-Faced Mezze Pita", "Cheesy Falafel Sub", "Toum Garlic Pita Wrap", "Beetroot Hummus Pita Pocket", "Pickled Veggie Shawarma", "DineOps Jumbo Shawarma Box"] },
  { name: "Waffles & Crepes", desc: "Belgian golden waffles and paper-thin French crepes with toppings", img: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80", items: ["Classic Belgian Waffle with Maple Syrup", "Nutella Overload Waffle", "Belgian Chocolate Dark Waffle", "Strawberry Cream Waffle", "Banana Caramel Crunch Waffle", "French Crepe with Nutella", "Berry Blast Crepe", "Oreo Cookie Crumble Waffle", "Red Velvet Cream Cheese Waffle", "Waffle Sundae Tower"] },
  { name: "Pancakes & Breakfast Bowls", desc: "Fluffy American pancake stacks and nutritious breakfast bowls", img: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&auto=format&fit=crop&q=80", items: ["Classic Buttermilk Pancakes (3 Pcs)", "Blueberry Compote Pancake Stack", "Choco Chip Honey Pancakes", "Nutella Banana Pancake Tower", "Acai Berry Smoothie Bowl", "Overnight Chia & Oat Bowl", "Granola & Greek Yogurt Parfait", "Peanut Butter Protein Bowl", "Avocado & Spinach Breakfast Bowl", "Tropical Mango Smoothie Bowl"] },
  { name: "Freshly Brewed Hot Coffee", desc: "Espresso based artisan hot coffees made from 100% Arabica beans", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80", items: ["Single Origin Espresso", "Americano Black Coffee", "Classic Italian Cappuccino", "Cafe Latte with Latte Art", "Flat White Silky", "Caramel Macchiato Hot", "Cafe Mocha Dark Chocolate", "Hazelnut Flavored Latte", "Vanilla Bean Latte", "Hot Filter Coffee South Indian"] },
  { name: "Iced Coffees & Frappes", desc: "Chilled blended coffees, cold brews, and creamy frappes", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80", items: ["Classic Iced Americano", "Classic Iced Latte", "Cold Coffee Classic Shake", "Hazelnut Frappe with Whipped Cream", "Mocha Brownie Frappe", "Caramel Popcorn Cold Coffee", "Nitro Cold Brew Coffee", "Vanilla Bean Iced Latte", "Irish Cream Iced Coffee (Non-Alc)", "Vietnamese Iced Sweet Coffee"] },
  { name: "Premium Teas & Chai", desc: "Fragrant leaf teas, Indian kadak chais, and herbal infusions", img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80", items: ["Kulhad Masala Chai", "Ginger Cardamom Kadak Chai", "Darjeeling First Flush Black Tea", "Japanese Matcha Green Tea", "Chamomile Herbal Infusion", "Lemon Honey Green Tea", "Moroccan Mint Green Tea", "Earl Grey with Bergamot", "Kashmiri Kahwa with Almonds", "Iced Peach Lemon Tea"] },
  { name: "Thick Milkshakes & Shakes", desc: "Ultra-thick milkshakes topped with whipped cream and chocolate drizzle", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80", items: ["Oreo Cookies & Cream Shake", "KitKat Crunch Milkshake", "Nutella Hazelnut Thickshake", "Belgian Dark Chocolate Shake", "Alphonso Mango Milkshake", "Fresh Strawberry Cream Shake", "Ferrero Rocher Deluxe Shake", "Lotus Biscoff Thickshake", "Vanilla Bean Thickshake", "Caramel Brownie Milkshake"] },
  { name: "Fresh Fruit Smoothies", desc: "Thick probiotic smoothies blended with fresh fruits and greek yogurt", img: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&auto=format&fit=crop&q=80", items: ["Mixed Wild Berry Smoothie", "Mango Banana Tropical Smoothie", "Green Detox Spinach Apple Smoothie", "Strawberry Kiwi Smoothie", "Dragonfruit Pink Smoothie", "Papaya & Orange Vitamin C Smoothie", "Blueberry Antioxidant Smoothie", "Pineapple Coconut Smoothie", "Avocado Honey Yogurt Smoothie", "Immunity Booster Citrus Smoothie"] },
  { name: "Freshly Squeezed Juices", desc: "100% natural, cold-pressed raw juices with zero added sugar", img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80", items: ["Fresh Sweet Lime (Mosambi) Juice", "Valencia Orange Juice Cold Pressed", "Fresh Pomegranate Juice", "Green Apple, Celery & Ginger Juice", "Watermelon Mint Refresh Juice", "Pineapple Mint Cooler Juice", "ABC Glow Juice (Apple, Beetroot, Carrot)", "Sugarcane Ginger Lemon Juice", "Fresh Guava Chili Juice", "Cucumber Lime Hydration Juice"] },
  { name: "Mocktails & Coolers", desc: "Fizzy, refreshing handcrafted non-alcoholic cocktails and sodas", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80", items: ["Classic Virgin Mojito", "Blue Curacao Ocean Breeze", "Green Apple Fizz Cooler", "Watermelon Basil Cooler", "Passion Fruit Sparkler", "Spiced Kala Khatta Cooler", "Guava Mary Chili Rim", "Ginger Peach Lemonade", "Strawberry Basil Spritzer", "Virgin Pina Colada"] },
  { name: "Ice Cream Sundaes & Scoops", desc: "Rich premium ice creams layered with nuts, fudge, and toppings", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80", items: ["Death by Chocolate Sundae", "Hot Fudge Brownie Sundae", "Banana Split Classic Sundae", "Alphonso Mango Sundae", "Roasted Almond & Praline Scoop", "Belgian Dark Chocolate Scoop", "Salted Caramel Crunch Scoop", "Vanilla Bean Classic Scoop", "Strawberry Cheesecake Scoop", "Tutti Frutti Cassata Slice"] },
  { name: "Cakes & Pastries", desc: "Freshly baked multilayer cakes and exquisite pastry slices", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80", items: ["Dark Chocolate Truffle Pastry", "New York Baked Cheesecake Slice", "Red Velvet Cream Cheese Pastry", "Lotus Biscoff Cheesecake Slice", "Blueberry Cold Cheesecake", "German Black Forest Pastry", "Pineapple Fresh Fruit Cake Slice", "Tiramisu Italian Pastry Slice", "Opera Coffee Chocolate Slice", "Nutella Hazelnut Tart"] },
  { name: "Brownies & Sizzling Delights", desc: "Warm fudgy brownies, lava cakes, and sizzling dessert platters", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80", items: ["Sizzling Brownie with Vanilla Ice Cream", "Chocochip Walnut Fudge Brownie", "Triple Chocolate Lava Cake", "Nutella Stuffed Brownie", "Salted Caramel Skillet Brownie", "Oreo Stuffed Brownie", "Blondie White Chocolate Brownie", "Gooey Chocolate Mug Cake", "Brownie Sundae Jar", "Biscoff Swirl Warm Brownie"] },
  { name: "Traditional Indian Sweets", desc: "Authentic halwas, gulab jamuns, and royal Indian desserts", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80", items: ["Hot Gulab Jamun with Rabdi (2 Pcs)", "Kesar Pista Rasmalai (2 Pcs)", "Moong Dal Halwa Desi Ghee", "Gajar Ka Halwa (Seasonal)", "Matka Kulfi with Falooda", "Shahi Tukda Royale with Rabdi", "Jalebi with Thick Creamy Rabdi", "Angoori Rasgulla (4 Pcs)", "Malai Cham Cham", "Dry Fruit Basundi Bowl"] },
  { name: "Cheese & Fondue Specials", desc: "Bubbling Swiss cheese pots served with croutons and skewers", img: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80", items: ["Classic Swiss Cheese Fondue", "Spicy Mexican Jalapeño Fondue", "Garlic Herb Fondue Pot", "Smoked Gouda & Cheddar Fondue", "Tomato Basil Fondue with Bread", "Peri-Peri Cheese Dip with Nachos", "Spinach Artichoke Warm Cheese Dip", "Cheese Fondue Platter with Veggies", "Four Cheese Bread Bowl Fondue", "Truffle Cheese Dip with Garlic Crostini"] },
  { name: "Nachos, Dips & Chips", desc: "Loaded crispy corn tortilla chips with salsa, sour cream, and queso", img: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80", items: ["Loaded Cheese Supreme Nachos", "Mexican Bean & Salsa Nachos", "Peri-Peri Seasoned Tortilla Chips", "Guacamole & Salsa Nacho Basket", "Barbecue Paneer Loaded Nachos", "Jalapeño Queso Nacho Bowl", "Nacho Salad Bowl with Corn", "Seven Layer Mexican Dip with Chips", "Chili Cheese Corn Nachos", "Grand Fiesta Nacho Platter"] },
  { name: "Momos & Baos", desc: "Steamed, fried, and pan-seared Asian street dumplings & fluffy bao buns", img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80", items: ["Classic Steamed Veg Momos (6 Pcs)", "Crispy Fried Veg Momos (6 Pcs)", "Pan-Seared Kothey Momos (6 Pcs)", "Tandoori Paneer Momos (6 Pcs)", "Afghani Malai Momos (6 Pcs)", "Schezwan Gravy Momos (6 Pcs)", "Steamed Paneer Bao Buns (2 Pcs)", "Crispy Mushroom & Slaw Bao (2 Pcs)", "Teriyaki Tofu Fluffy Bao (2 Pcs)", "DineOps Assorted Momo Platter"] },
  { name: "Rice Bowls & Combo Meals", desc: "Satisfying all-in-one lunch and dinner bowls", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80", items: ["Paneer Butter Masala with Jeera Rice Bowl", "Dal Makhani with Garlic Naan Combo", "Chole Chawal Punjabi Bowl", "Rajma Chawal Home Style Bowl", "Hakka Noodles with Manchurian Combo", "Fried Rice with Chili Paneer Bowl", "Mexican Burrito Bowl with Guacamole", "Thai Green Curry with Jasmine Rice Bowl", "Biryani with Mirchi Ka Salan Bowl", "Kadhi Pakoda with Steamed Rice Bowl"] },
  { name: "Healthy Keto & Diet Specials", desc: "Low-carb, high-protein, and calorie-counted wellness meals", img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80", items: ["Grilled Paneer Salad with Avocado", "Cauliflower Fried Rice with Tofu", "Keto Zucchini Noodles with Pesto", "High Protein Sprout & Paneer Chaat", "Avocado & Flaxseed Smoothie", "Sautéed Herb Broccoli & Mushroom", "Quinoa Veggie Stir Fry", "Tofu Scramble with Bell Peppers", "Boiled Chickpea & Lime Salad", "Detox Green Salad with Chia Seeds"] },
  { name: "South Indian Thali Specials", desc: "Authentic regional lunch platters with rice, sambar, rasam, and curries", img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80", items: ["Mini South Indian Tiffin Thali", "Chettinad Veg Curry with Rice", "Bisi Bele Bath (Hot Lentil Rice)", "Rasam Vada Bowl", "Lemon Rice with Roasted Peanuts", "Tamarind Pulihora Rice", "Tomato Coconut Rice with Papad", "Ghee Sambar Rice Bowl", "Avial (Mixed Veggies in Coconut) with Rice", "Grand South Indian Banana Leaf Thali"] },
  { name: "Kids Special Meal Box", desc: "Kid-friendly portions, gentle spices, and fun shapes", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80", items: ["Mini Cheese Burger with Smileys", "Creamy Cheese Macaroni Junior", "Smileys & Potato Gems Box", "Nutella Pancake with Sprinkles", "Cheesy Mini Pizza 6-inch", "Strawberry Milkshake with Marshmallows", "Cheese Toast Sticks with Ketchup", "French Fries & Veggie Pops", "Junior Paneer Roll", "Choco Fudge Junior Sundae"] },
  { name: "Gourmet Dessert Jars", desc: "Artisanal desserts layered neatly in glass jars", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80", items: ["Lotus Biscoff Cheesecake Jar", "Nutella Mud Cake Jar", "Tiramisu Mascarpone Jar", "Red Velvet Cream Cheese Jar", "Ferrero Rocher Mousse Jar", "Blueberry Crumble Jar", "Mango Panna Cotta Jar", "Oreo Choco Crunch Jar", "Banoffee Pie Dessert Jar", "Dark Chocolate Mousse Jar"] },
  { name: "Midnight Munchies", desc: "Late night cravings, spicy bites, and quick comfort foods", img: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80", items: ["Midnight Maggi Loaded with Cheese", "Spicy Schezwan Butter Maggi", "Cheesy Garlic Breadsticks", "Crispy French Fries with Peri-Peri", "Paneer Tikka Roll Late Night", "Cold Coffee with Ice Cream", "Nutella Toast Double Slice", "Chili Cheese Toast Late Night", "Nachos with Extra Cheese Dip", "Hot Chocolate with Marshmallows"] }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    const restaurant = await Restaurant.findOne();
    const restaurantId = restaurant ? restaurant._id : null;
    console.log(`Using Restaurant: ${restaurant ? restaurant.name : "None (Global)"} (${restaurantId})`);

    console.log("Cleaning existing Menu Categories and Items...");
    await MenuCategory.deleteMany({});
    await MenuItem.deleteMany({});
    console.log("Cleared old menu data.");

    let totalCategories = 0;
    let totalItems = 0;

    // Combine base and extra categories
    const allCategoriesToSeed = [...MENU_DATA];

    for (const extra of EXTRA_CATEGORIES) {
      allCategoriesToSeed.push({
        name: extra.name,
        description: extra.desc,
        image: extra.img,
        items: extra.items.map((itemName, idx) => ({
          name: itemName,
          description: `Delicious freshly prepared ${itemName.toLowerCase()} with premium ingredients.`,
          price: 120 + ((idx * 27) % 280),
          image: extra.img
        }))
      });
    }

    console.log(`Preparing to seed ${allCategoriesToSeed.length} Categories...`);

    let sortOrder = 1;
    for (const catData of allCategoriesToSeed) {
      const categoryDoc = await MenuCategory.create({
        name: catData.name,
        description: catData.description,
        image: catData.image,
        sortOrder: sortOrder++,
        restaurant: restaurantId,
        status: "active"
      });
      totalCategories++;

      const itemsToInsert = catData.items.map(item => ({
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: categoryDoc._id,
        restaurant: restaurantId,
        availability: true,
        status: "active"
      }));

      await MenuItem.insertMany(itemsToInsert);
      totalItems += itemsToInsert.length;
    }

    console.log(`\n======================================================`);
    console.log(`🎉 MENU SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`======================================================`);
    console.log(`Total Categories Created: ${totalCategories}`);
    console.log(`Total Menu Items Created: ${totalItems}`);
    console.log(`Average Items per Category: ${(totalItems / totalCategories).toFixed(1)}`);
    console.log(`======================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  }
}

seed();
