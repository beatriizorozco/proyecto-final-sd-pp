using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CentroHipico.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSexoToCaballos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Sexo",
                table: "Caballos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Sexo",
                table: "Caballos");
        }
    }
}
