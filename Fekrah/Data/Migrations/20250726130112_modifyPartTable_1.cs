using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class modifyPartTable1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Discount",
                table: "Parts",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "FinalPrice",
                table: "Parts",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<bool>(
                name: "IsDelivery",
                table: "Parts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFavorit",
                table: "Parts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PartType",
                table: "Parts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Quality",
                table: "Parts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "YearOfManufacture",
                table: "Parts",
                type: "int",
                maxLength: 4,
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discount",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "FinalPrice",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "IsDelivery",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "IsFavorit",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "PartType",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "Quality",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "YearOfManufacture",
                table: "Parts");
        }
    }
}
