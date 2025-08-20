using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class addPromoCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "MinOrderSubtotal",
                table: "Offers",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PerUserLimit",
                table: "Offers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PromoCode",
                table: "Offers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimesUsed",
                table: "Offers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsageLimit",
                table: "Offers",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MinOrderSubtotal",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "PerUserLimit",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "PromoCode",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "TimesUsed",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "UsageLimit",
                table: "Offers");
        }
    }
}
