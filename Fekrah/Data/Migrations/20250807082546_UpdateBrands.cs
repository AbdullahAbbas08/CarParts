using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBrands : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ModelTypes_CarsModels_CarsModelId",
                table: "ModelTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts");

            migrationBuilder.DropTable(
                name: "CarsModels");

            migrationBuilder.DropIndex(
                name: "IX_ModelTypes_CarsModelId",
                table: "ModelTypes");

            migrationBuilder.RenameColumn(
                name: "CarsModelId",
                table: "Parts",
                newName: "BrandId");

            migrationBuilder.RenameIndex(
                name: "IX_Parts_CarsModelId",
                table: "Parts",
                newName: "IX_Parts_BrandId");

            migrationBuilder.RenameColumn(
                name: "CarsModelId",
                table: "ModelTypes",
                newName: "Year");

            migrationBuilder.AddColumn<int>(
                name: "BrandId",
                table: "ModelTypes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Brands",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Brands_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Brands_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ModelTypes_BrandId",
                table: "ModelTypes",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Brands_CreatedByUserId",
                table: "Brands",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Brands_UpdatedBy",
                table: "Brands",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_ModelTypes_Brands_BrandId",
                table: "ModelTypes",
                column: "BrandId",
                principalTable: "Brands",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_Brands_BrandId",
                table: "Parts",
                column: "BrandId",
                principalTable: "Brands",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ModelTypes_Brands_BrandId",
                table: "ModelTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_Parts_Brands_BrandId",
                table: "Parts");

            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropIndex(
                name: "IX_ModelTypes_BrandId",
                table: "ModelTypes");

            migrationBuilder.DropColumn(
                name: "BrandId",
                table: "ModelTypes");

            migrationBuilder.RenameColumn(
                name: "BrandId",
                table: "Parts",
                newName: "CarsModelId");

            migrationBuilder.RenameIndex(
                name: "IX_Parts_BrandId",
                table: "Parts",
                newName: "IX_Parts_CarsModelId");

            migrationBuilder.RenameColumn(
                name: "Year",
                table: "ModelTypes",
                newName: "CarsModelId");

            migrationBuilder.CreateTable(
                name: "CarsModels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarsModels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CarsModels_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CarsModels_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ModelTypes_CarsModelId",
                table: "ModelTypes",
                column: "CarsModelId");

            migrationBuilder.CreateIndex(
                name: "IX_CarsModels_CreatedByUserId",
                table: "CarsModels",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CarsModels_UpdatedBy",
                table: "CarsModels",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_ModelTypes_CarsModels_CarsModelId",
                table: "ModelTypes",
                column: "CarsModelId",
                principalTable: "CarsModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts",
                column: "CarsModelId",
                principalTable: "CarsModels",
                principalColumn: "Id");
        }
    }
}
