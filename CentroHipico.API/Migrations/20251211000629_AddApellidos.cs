using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CentroHipico.API.Migrations
{
    /// <inheritdoc />
    public partial class AddApellidos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClasesHipica_Jinetes_MonitorId",
                table: "ClasesHipica");

            migrationBuilder.RenameColumn(
                name: "MonitorId",
                table: "ClasesHipica",
                newName: "ProfesorId");

            migrationBuilder.RenameIndex(
                name: "IX_ClasesHipica_MonitorId",
                table: "ClasesHipica",
                newName: "IX_ClasesHipica_ProfesorId");

            migrationBuilder.AddColumn<string>(
                name: "Apellidos",
                table: "Jinetes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Profesores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Apellidos = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Especialidad = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AniosExperiencia = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profesores", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_ClasesHipica_Profesores_ProfesorId",
                table: "ClasesHipica",
                column: "ProfesorId",
                principalTable: "Profesores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClasesHipica_Profesores_ProfesorId",
                table: "ClasesHipica");

            migrationBuilder.DropTable(
                name: "Profesores");

            migrationBuilder.DropColumn(
                name: "Apellidos",
                table: "Jinetes");

            migrationBuilder.RenameColumn(
                name: "ProfesorId",
                table: "ClasesHipica",
                newName: "MonitorId");

            migrationBuilder.RenameIndex(
                name: "IX_ClasesHipica_ProfesorId",
                table: "ClasesHipica",
                newName: "IX_ClasesHipica_MonitorId");

            migrationBuilder.AddForeignKey(
                name: "FK_ClasesHipica_Jinetes_MonitorId",
                table: "ClasesHipica",
                column: "MonitorId",
                principalTable: "Jinetes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
