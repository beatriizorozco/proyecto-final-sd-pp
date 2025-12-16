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
    public class ClasesHipicaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClasesHipicaController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClaseHipica>>> GetClasesHipica()
        {
            var ahora = DateTime.Now;

            return await _context.ClasesHipica
                .Where(c => c.Fecha >= ahora)
                .Include(c => c.Disciplina)
                .Include(c => c.Nivel)
                .Include(c => c.Profesor)
                .ToListAsync();
        }

        // GET
        [HttpGet("{id}")]
        public async Task<ActionResult<ClaseHipica>> GetClaseHipica(int id)
        {
            var claseHipica = await _context.ClasesHipica
                .Include(c => c.Disciplina)
                .Include(c => c.Nivel)
                .Include(c => c.Profesor)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (claseHipica == null)
            {
                return NotFound();
            }

            return claseHipica;
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutClaseHipica(int id, ClaseHipica claseHipica)
        {
            if (id != claseHipica.Id)
            {
                return BadRequest();
            }

            _context.Entry(claseHipica).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClaseHipicaExists(id))
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
        public async Task<ActionResult<ClaseHipica>> PostClaseHipica(ClaseHipica claseHipica)
        {
            _context.ClasesHipica.Add(claseHipica);
            await _context.SaveChangesAsync();

            // Recargo la clase con las relaciones para devolverla completa
            var claseCompleta = await _context.ClasesHipica
                .Include(c => c.Disciplina)
                .Include(c => c.Nivel)
                .Include(c => c.Profesor)
                .FirstOrDefaultAsync(c => c.Id == claseHipica.Id);

            return CreatedAtAction(
                nameof(GetClaseHipica),
                new { id = claseHipica.Id },
                claseCompleta ?? claseHipica
            );
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClaseHipica(int id)
        {
            var claseHipica = await _context.ClasesHipica.FindAsync(id);
            if (claseHipica == null)
            {
                return NotFound();
            }

            _context.ClasesHipica.Remove(claseHipica);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ClaseHipicaExists(int id)
        {
            return _context.ClasesHipica.Any(e => e.Id == id);
        }
    }
}
