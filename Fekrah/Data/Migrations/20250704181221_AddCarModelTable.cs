using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCarModelTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Sellers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<double>(
                name: "Rating",
                table: "Sellers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AlterColumn<double>(
                name: "Price",
                table: "Parts",
                type: "float",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AddColumn<int>(
                name: "CarsModelId",
                table: "Parts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CarsModels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarsModels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CarsModels_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CarsModels_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Offers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NewPrice = table.Column<double>(type: "float", nullable: false),
                    DiscountRate = table.Column<double>(type: "float", nullable: false),
                    PartId = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Offers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Offers_Parts_PartId",
                        column: x => x.PartId,
                        principalTable: "Parts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Offers_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Offers_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Parts_CarsModelId",
                table: "Parts",
                column: "CarsModelId");

            migrationBuilder.CreateIndex(
                name: "IX_CarsModels_CreatedBy",
                table: "CarsModels",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_CarsModels_UpdatedBy",
                table: "CarsModels",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_CreatedBy",
                table: "Offers",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_PartId",
                table: "Offers",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_UpdatedBy",
                table: "Offers",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts",
                column: "CarsModelId",
                principalTable: "CarsModels",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts");

            migrationBuilder.DropTable(
                name: "CarsModels");

            migrationBuilder.DropTable(
                name: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Parts_CarsModelId",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "CarsModelId",
                table: "Parts");

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "Parts",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");
        }
    }
}
