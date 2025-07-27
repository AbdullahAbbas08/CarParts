using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class modifyPartTable2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parts_ModelTypes_ModelTypeId",
                table: "Parts");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Sellers_SellerId",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "SellerId",
                table: "Users",
                newName: "MerchantId");

            migrationBuilder.RenameIndex(
                name: "IX_Users_SellerId",
                table: "Users",
                newName: "IX_Users_MerchantId");

            migrationBuilder.RenameColumn(
                name: "ModelTypeId",
                table: "Parts",
                newName: "CountryOfManufactureId");

            migrationBuilder.RenameIndex(
                name: "IX_Parts_ModelTypeId",
                table: "Parts",
                newName: "IX_Parts_CountryOfManufactureId");

            migrationBuilder.AddColumn<int>(
                name: "CarModelTypeId",
                table: "Parts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CountryOfManufacture",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CountryOfManufacture", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CountryOfManufacture_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CountryOfManufacture_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Parts_CarModelTypeId",
                table: "Parts",
                column: "CarModelTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_CountryOfManufacture_CreatedByUserId",
                table: "CountryOfManufacture",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CountryOfManufacture_UpdatedBy",
                table: "CountryOfManufacture",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_CountryOfManufacture_CountryOfManufactureId",
                table: "Parts",
                column: "CountryOfManufactureId",
                principalTable: "CountryOfManufacture",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_ModelTypes_CarModelTypeId",
                table: "Parts",
                column: "CarModelTypeId",
                principalTable: "ModelTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Sellers_MerchantId",
                table: "Users",
                column: "MerchantId",
                principalTable: "Sellers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parts_CountryOfManufacture_CountryOfManufactureId",
                table: "Parts");

            migrationBuilder.DropForeignKey(
                name: "FK_Parts_ModelTypes_CarModelTypeId",
                table: "Parts");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Sellers_MerchantId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "CountryOfManufacture");

            migrationBuilder.DropIndex(
                name: "IX_Parts_CarModelTypeId",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "CarModelTypeId",
                table: "Parts");

            migrationBuilder.RenameColumn(
                name: "MerchantId",
                table: "Users",
                newName: "SellerId");

            migrationBuilder.RenameIndex(
                name: "IX_Users_MerchantId",
                table: "Users",
                newName: "IX_Users_SellerId");

            migrationBuilder.RenameColumn(
                name: "CountryOfManufactureId",
                table: "Parts",
                newName: "ModelTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_Parts_CountryOfManufactureId",
                table: "Parts",
                newName: "IX_Parts_ModelTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_ModelTypes_ModelTypeId",
                table: "Parts",
                column: "ModelTypeId",
                principalTable: "ModelTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Sellers_SellerId",
                table: "Users",
                column: "SellerId",
                principalTable: "Sellers",
                principalColumn: "Id");
        }
    }
}
