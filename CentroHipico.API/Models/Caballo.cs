namespace CentroHipico.API.Models
{
    public class Caballo
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = "";
        public int Edad { get; set; }
        public string Nivel { get; set; } = "";
        public bool EsPropio { get; set; }
        public string Sexo { get; set; } = "M";
    }
}
