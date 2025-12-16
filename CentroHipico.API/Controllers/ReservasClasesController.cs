using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentroHipico.API.Data;
using CentroHipico.API.Models;

namespace CentroHipico.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservasClasesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReservasClasesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservaClase>>> GetReservasClase()
        {
            return await _context.ReservasClase
                .Include(r => r.Jinete)
                .Include(r => r.ClaseHipica)
                .ToListAsync();
        }

        // GET
        [HttpGet("{id}")]
        public async Task<ActionResult<ReservaClase>> GetReservaClase(int id)
        {
            var reservaClase = await _context.ReservasClase
                .Include(r => r.Jinete)
                .Include(r => r.ClaseHipica)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservaClase == null)
            {
                return NotFound();
            }

            return reservaClase;
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReservaClase(int id, ReservaClase reservaClase)
        {
            if (id != reservaClase.Id)
            {
                return BadRequest("El id de la URL no coincide con el de la reserva.");
            }

            var error = await ValidarReservaClaseAsync(reservaClase, esActualizacion: true);
            if (error != null)
            {
                return BadRequest(error);
            }

            _context.Entry(reservaClase).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ReservaClaseExistsAsync(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST
        [HttpPost]
        public async Task<ActionResult<ReservaClase>> PostReservaClase(ReservaClase reservaClase)
        {
            var error = await ValidarReservaClaseAsync(reservaClase);
            if (error != null)
            {
                return BadRequest(error);
            }

            _context.ReservasClase.Add(reservaClase);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReservaClase), new { id = reservaClase.Id }, reservaClase);
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservaClase(int id)
        {
            var reservaClase = await _context.ReservasClase.FindAsync(id);
            if (reservaClase == null)
            {
                return NotFound();
            }

            _context.ReservasClase.Remove(reservaClase);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET
        [HttpGet("jinete/{jineteId}")]
        public async Task<ActionResult<IEnumerable<ReservaClase>>> GetReservasPorJinete(int jineteId)
        {
            return await _context.ReservasClase
                .Where(r => r.JineteId == jineteId)
                .Include(r => r.ClaseHipica)
                .ToListAsync();
        }

        // GET
        [HttpGet("clase/{claseHipicaId}")]
        public async Task<ActionResult<IEnumerable<ReservaClase>>> GetReservasPorClase(int claseHipicaId)
        {
            var reservas = await _context.ReservasClase
                .Where(r => r.ClaseHipicaId == claseHipicaId)
                .Include(r => r.Jinete)
                .Include(r => r.ClaseHipica)
                .ToListAsync();

            return reservas;
        }

        private async Task<string?> ValidarReservaClaseAsync(ReservaClase reserva, bool esActualizacion = false)
        {
            //Compruebo quue la clase existe
            var clase = await _context.ClasesHipica
                .Include(c => c.Reservas)
                .FirstOrDefaultAsync(c => c.Id == reserva.ClaseHipicaId);

            if (clase == null)
                return "La clase indicada no existe.";

            //Compruebo que el jinete existe
            var jinete = await _context.Jinetes.FindAsync(reserva.JineteId);
            if (jinete == null)
                return "El jinete indicado no existe.";

            //Valido que es una fecha futura
            if (clase.Fecha <= DateTime.Now)
                return "No se pueden reservar clases en fechas pasadas.";

            //Valido que el jinete no esté ya apuntado a la clase
            var reservasQuery = _context.ReservasClase.AsQueryable();

            if (esActualizacion)
                reservasQuery = reservasQuery.Where(r => r.Id != reserva.Id);

            bool yaApuntado = await reservasQuery.AnyAsync(r =>
                r.ClaseHipicaId == reserva.ClaseHipicaId &&
                r.JineteId == reserva.JineteId
            );

            if (yaApuntado)
                return "El jinete ya está inscrito en esta clase.";

            //Validio que no se supere el máximo de plazas de la clase
            int reservasExistentes = await reservasQuery
                .Where(r => r.ClaseHipicaId == reserva.ClaseHipicaId)
                .CountAsync();

            if (reservasExistentes >= clase.PlazasMaximas)
                return $"La clase está completa. Plazas máximas: {clase.PlazasMaximas}.";

            //Máximo de una clase son 8 caballos
            if (clase.PlazasMaximas > 8)
                return "No se puede crear una clase con más de 10 caballos (límite del centro).";

            return null;
        }

        private Task<bool> ReservaClaseExistsAsync(int id)
        {
            return _context.ReservasClase.AnyAsync(e => e.Id == id);
        }
    }
}
