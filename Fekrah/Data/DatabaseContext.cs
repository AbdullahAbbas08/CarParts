﻿using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

public class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options)
        : base(options)
    { }

    public DbSet<Part> Parts { get; set; }
    public DbSet<Seller> Sellers { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; } // Added


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Seller>()
            .HasMany(s => s.Parts)
            .WithOne(p => p.Seller)
            .HasForeignKey(p => p.SellerId);

        modelBuilder.Entity<Category>()
          .HasMany(c => c.Parts)
          .WithOne(p => p.Category)
          .HasForeignKey(p => p.CategoryId);
    }
}
