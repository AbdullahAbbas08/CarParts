using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGovernorate2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts");

            migrationBuilder.RenameColumn(
                name: "LogoUrl",
                table: "Sellers",
                newName: "NationalIdImage");

            migrationBuilder.AddColumn<string>(
                name: "CommercialRegistrationImage",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CommercialRegistrationNumber",
                table: "Sellers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Logo",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NationalIdNumber",
                table: "Sellers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "CarsModelId",
                table: "Parts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "ModelTypeId",
                table: "Parts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ModelTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CarsModelId = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelTypes_CarsModels_CarsModelId",
                        column: x => x.CarsModelId,
                        principalTable: "CarsModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModelTypes_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ModelTypes_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Parts_ModelTypeId",
                table: "Parts",
                column: "ModelTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelTypes_CarsModelId",
                table: "ModelTypes",
                column: "CarsModelId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelTypes_CreatedByUserId",
                table: "ModelTypes",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelTypes_UpdatedBy",
                table: "ModelTypes",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts",
                column: "CarsModelId",
                principalTable: "CarsModels",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_ModelTypes_ModelTypeId",
                table: "Parts",
                column: "ModelTypeId",
                principalTable: "ModelTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts");

            migrationBuilder.DropForeignKey(
                name: "FK_Parts_ModelTypes_ModelTypeId",
                table: "Parts");

            migrationBuilder.DropTable(
                name: "ModelTypes");

            migrationBuilder.DropIndex(
                name: "IX_Parts_ModelTypeId",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "CommercialRegistrationImage",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "CommercialRegistrationNumber",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "Logo",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "NationalIdNumber",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "ModelTypeId",
                table: "Parts");

            migrationBuilder.RenameColumn(
                name: "NationalIdImage",
                table: "Sellers",
                newName: "LogoUrl");

            migrationBuilder.AlterColumn<int>(
                name: "CarsModelId",
                table: "Parts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts",
                column: "CarsModelId",
                principalTable: "CarsModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
