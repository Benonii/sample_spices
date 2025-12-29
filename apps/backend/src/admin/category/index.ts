import { Hono } from "hono";
import { db } from "@/db";
import { productCategory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as createId } from "uuid";

const categoryRouter = new Hono();

// Create category
categoryRouter.post("/", async (c) => {
    try {
        const { name, description } = await c.req.json();
        
        if (!name) {
            return c.json({ error: "Category name is required" }, 400);
        }
        
        const now = new Date();
        const [newCategory] = await db
            .insert(productCategory)
            .values({
                id: createId(),
                name,
                description: description || "",
                createdAt: now,
                updatedAt: now,
            })
            .returning();
            
        return c.json({
            message: "Category created successfully!",
            category: newCategory,
        });
    } catch (error) {
        return c.json({ 
            error: "Failed to create category",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

categoryRouter.get("/", async (c) => {
    try {
        const categories = await db.select().from(productCategory).orderBy(productCategory.name);
        
        return c.json({
            list: categories,
            total: categories.length,
        });
    } catch (error) {
        return c.json({ 
            error: "Failed to fetch categories",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Get single category
categoryRouter.get("/:id", async (c) => {
    const categoryId = c.req.param("id");
    
    try {
        const [category] = await db
            .select()
            .from(productCategory)
            .where(eq(productCategory.id, categoryId));
            
        if (!category) {
            return c.json({ error: "Category not found" }, 404);
        }
        
        return c.json(category);
    } catch (error) {
        return c.json({ 
            error: "Failed to fetch category",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});



// Update category
categoryRouter.put("/:id", async (c) => {
    const categoryId = c.req.param("id");
    
    try {
        const { name, description } = await c.req.json();
        
        if (!name) {
            return c.json({ error: "Category name is required" }, 400);
        }
        
        const now = new Date();
        const [updatedCategory] = await db
            .update(productCategory)
            .set({
                name,
                description: description || "",
                updatedAt: now,
            })
            .where(eq(productCategory.id, categoryId))
            .returning();
            
        if (!updatedCategory) {
            return c.json({ error: "Category not found" }, 404);
        }
        
        return c.json({
            message: "Category updated successfully!",
            category: updatedCategory,
        });
    } catch (error) {
        return c.json({ 
            error: "Failed to update category",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Delete category
categoryRouter.delete("/:id", async (c) => {
    const categoryId = c.req.param("id");
    
    try {
        const [deletedCategory] = await db
            .delete(productCategory)
            .where(eq(productCategory.id, categoryId))
            .returning();
            
        if (!deletedCategory) {
            return c.json({ error: "Category not found" }, 404);
        }
        
        return c.json({
            message: "Category deleted successfully!",
            category: deletedCategory,
        });
    } catch (error) {
        return c.json({ 
            error: "Failed to delete category",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

export default categoryRouter;
