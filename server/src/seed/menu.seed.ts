import { FoodType, PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/hash";

export async function seedMenu() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_DIRECT,
      },
    },
  });

  try {
    const hashedPassword = await hashPassword(
      process.env.SEED_RESTAURANT_PASSWORD!,
    );

    const owner = await prisma.user.upsert({
      where: { email: process.env.SEED_RESTAURANT_EMAIL },
      update: {},
      create: {
        name: process.env.SEED_RESTAURANT_NAME!,
        email: process.env.SEED_RESTAURANT_EMAIL!,
        password: hashedPassword,
        role: "RESTAURANT_OWNER",
      },
    });

    const restaurant = await prisma.restaurant.upsert({
      where: { slug: process.env.SEED_RESTAURANT_SLUG },
      update: {},
      create: {
        name: process.env.SEED_RESTAURANT_NAME!,
        slug: process.env.SEED_RESTAURANT_SLUG!,
        ownerId: owner.id,
        isActive: true,
        isVerified: true,
      },
    });

    const categoryNames = [
      "Burger",
      "Pizza",
      "Sandwich",
      "Beverages",
      "Dessert",
      "Starter",
      "Pasta",
      "Main Course",
    ];

    for (const name of categoryNames) {
      await prisma.category.upsert({
        where: {
          restaurantId_name: {
            restaurantId: restaurant.id,
            name,
          },
        },
        update: {},
        create: {
          name,
          restaurantId: restaurant.id,
        },
      });
    }

    const categories = await prisma.category.findMany({
      where: { restaurantId: restaurant.id },
    });

    const menuDataMap: Record<string, any[]> = {
      Burger: [
        {
          name: "Classic Burger",
          description: "Adipoli burger",
          foodType: FoodType.NON_VEG,
          price: 120,
        },
        {
          name: "Smashed Beef Burger",
          description: "Scn burger",
          foodType: FoodType.NON_VEG,
          price: 140,
        },
        {
          name: "Veggie Deluxe Burger",
          description: "Crispy veg patty",
          foodType: FoodType.VEG,
          price: 110,
        },
        {
          name: "Chicken Tikka Burger",
          description: "Spicy Indian style",
          foodType: FoodType.NON_VEG,
          price: 150,
        },
        {
          name: "Spicy Paneer Burger",
          description: "Hot paneer crunch",
          foodType: FoodType.VEG,
          price: 130,
        },
        {
          name: "Double Cheese Burger",
          description: "Extra cheesy goodness",
          foodType: FoodType.NON_VEG,
          price: 160,
        },
        {
          name: "BBQ Bacon Burger",
          description: "Smoky and rich",
          foodType: FoodType.NON_VEG,
          price: 180,
        },
      ],
      Pizza: [
        {
          name: "BBQ Pizza",
          description: "Adipoli pizza",
          foodType: FoodType.NON_VEG,
        },
        {
          name: "Mushroom Pizza",
          description: "Scn pizza",
          foodType: FoodType.VEG,
          price: 130,
        },
        {
          name: "Margherita",
          description: "Classic cheese and tomato",
          foodType: FoodType.VEG,
        },
        {
          name: "Pepperoni Blast",
          description: "Loaded with pepperoni",
          foodType: FoodType.NON_VEG,
          price: 250,
        },
        {
          name: "Veggie Supreme",
          description: "All the veggies",
          foodType: FoodType.VEG,
          price: 200,
        },
        {
          name: "Chicken Tandoori Pizza",
          description: "Desi style",
          foodType: FoodType.NON_VEG,
          price: 240,
        },
        {
          name: "Four Cheese Pizza",
          description: "Mozzarella, cheddar, feta, parmesan",
          foodType: FoodType.VEG,
          price: 260,
        },
      ],
      Sandwich: [
        {
          name: "Club Sandwich",
          description: "Adipoli sandwich",
          foodType: FoodType.NON_VEG,
          price: 100,
        },
        {
          name: "Grilled Chicken Sandwich",
          description: "Scn sandwich",
          foodType: FoodType.NON_VEG,
          price: 120,
        },
        {
          name: "Bombay Veg Sandwich",
          description: "Street style",
          foodType: FoodType.VEG,
          price: 80,
        },
        {
          name: "Tuna Melt",
          description: "Cheesy tuna goodness",
          foodType: FoodType.NON_VEG,
          price: 150,
        },
        {
          name: "BLT",
          description: "Bacon, lettuce, tomato",
          foodType: FoodType.NON_VEG,
          price: 140,
        },
        {
          name: "Paneer Tikka Sandwich",
          description: "Grilled paneer",
          foodType: FoodType.VEG,
          price: 110,
        },
        {
          name: "Egg & Mayo",
          description: "Classic breakfast sandwich",
          foodType: FoodType.NON_VEG,
          price: 90,
        },
      ],
      Beverages: [
        {
          name: "Cold Coffee",
          description: "Thick and creamy",
          foodType: FoodType.VEG,
        },
        {
          name: "Lemon Mint Mojito",
          description: "Refreshing drink",
          foodType: FoodType.VEG,
          price: 80,
        },
        {
          name: "Chocolate Shake",
          description: "Rich cocoa",
          foodType: FoodType.VEG,
          price: 120,
        },
        {
          name: "Strawberry Smoothie",
          description: "Fresh berries",
          foodType: FoodType.VEG,
          price: 130,
        },
        {
          name: "Fresh Lime Soda",
          description: "Sweet and salt",
          foodType: FoodType.VEG,
          price: 50,
        },
        {
          name: "Mango Lassi",
          description: "Sweet yogurt drink",
          foodType: FoodType.VEG,
          price: 70,
        },
        {
          name: "Iced Peach Tea",
          description: "Chilled tea",
          foodType: FoodType.VEG,
          price: 90,
        },
      ],
      Dessert: [
        {
          name: "Chocolate Brownie",
          description: "Warm and fudgy",
          foodType: FoodType.VEG,
          price: 100,
        },
        {
          name: "Vanilla Ice Cream",
          description: "Two scoops",
          foodType: FoodType.VEG,
          price: 60,
        },
        {
          name: "Tiramisu",
          description: "Coffee flavored Italian dessert",
          foodType: FoodType.VEG,
          price: 150,
        },
        {
          name: "New York Cheesecake",
          description: "Rich and creamy",
          foodType: FoodType.VEG,
          price: 180,
        },
        {
          name: "Gulab Jamun",
          description: "Hot Indian sweets",
          foodType: FoodType.VEG,
          price: 50,
        },
        {
          name: "Red Velvet Cake",
          description: "Slice of cake",
          foodType: FoodType.VEG,
          price: 120,
        },
      ],
      Starter: [
        {
          name: "French Fries",
          description: "Crispy golden fries",
          foodType: FoodType.VEG,
        },
        {
          name: "Peri Peri Fries",
          description: "Spicy fries",
          foodType: FoodType.VEG,
          price: 110,
        },
        {
          name: "Chicken Nuggets",
          description: "6 pieces",
          foodType: FoodType.NON_VEG,
          price: 140,
        },
        {
          name: "Paneer Tikka Starter",
          description: "Tandoori paneer",
          foodType: FoodType.VEG,
          price: 160,
        },
        {
          name: "Garlic Bread with Cheese",
          description: "4 slices",
          foodType: FoodType.VEG,
          price: 120,
        },
        {
          name: "Onion Rings",
          description: "Crispy batter fried",
          foodType: FoodType.VEG,
          price: 90,
        },
      ],
      Pasta: [
        {
          name: "Alfredo Chicken Pasta",
          description: "White sauce",
          foodType: FoodType.NON_VEG,
          price: 220,
        },
        {
          name: "Arrabbiata Veg",
          description: "Spicy red sauce",
          foodType: FoodType.VEG,
          price: 180,
        },
        {
          name: "Pesto Penne",
          description: "Basil and pine nuts",
          foodType: FoodType.VEG,
          price: 200,
        },
        {
          name: "Mac & Cheese",
          description: "Comfort food",
          foodType: FoodType.VEG,
          price: 150,
        },
        {
          name: "Spaghetti Carbonara",
          description: "Creamy bacon pasta",
          foodType: FoodType.NON_VEG,
          price: 250,
        },
      ],
      "Main Course": [
        {
          name: "Butter Chicken",
          description: "Rich gravy",
          foodType: FoodType.NON_VEG,
          price: 280,
        },
        {
          name: "Paneer Butter Masala",
          description: "Creamy veg curry",
          foodType: FoodType.VEG,
          price: 240,
        },
        {
          name: "Chicken Biryani",
          description: "Aromatic rice and meat",
          foodType: FoodType.NON_VEG,
          price: 200,
        },
        {
          name: "Veg Fried Rice",
          description: "Indo-chinese style",
          foodType: FoodType.VEG,
          price: 140,
        },
        {
          name: "Dal Makhani",
          description: "Slow cooked lentils",
          foodType: FoodType.VEG,
          price: 180,
        },
      ],
    };

    const foodItemsData = [];

    for (const category of categories) {
      const itemsForCategory = menuDataMap[category.name];
      if (itemsForCategory) {
        for (const item of itemsForCategory) {
          foodItemsData.push({
            ...item,
            categoryId: category.id,
            restaurantId: restaurant.id,
          });
        }
      }
    }

    await prisma.menuItem.createMany({
      data: foodItemsData,
      skipDuplicates: true,
    });

    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: restaurant.id,
      },
    });

    const variantsData = [];

    for (const item of menuItems) {
      if (item.name === "BBQ Pizza" || item.name === "Margherita") {
        variantsData.push(
          { label: "Regular", price: 120, menuItemId: item.id },
          { label: "Medium", price: 200, menuItemId: item.id },
          { label: "Large", price: 280, menuItemId: item.id },
        );
      }

      if (item.name === "Classic Burger") {
        variantsData.push(
          { label: "Single Patty", price: 120, menuItemId: item.id },
          { label: "Double Patty", price: 160, menuItemId: item.id },
        );
      }

      if (item.name === "Cold Coffee") {
        variantsData.push(
          { label: "Regular", price: 100, menuItemId: item.id },
          { label: "With Ice Cream", price: 140, menuItemId: item.id },
        );
      }

      if (item.name === "French Fries") {
        variantsData.push(
          { label: "Small", price: 80, menuItemId: item.id },
          { label: "Large", price: 120, menuItemId: item.id },
        );
      }
    }

    await prisma.menuVariant.createMany({
      data: variantsData,
      skipDuplicates: true,
    });

    console.log("50 Menu Items & Variants seeded successfully");
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
}
