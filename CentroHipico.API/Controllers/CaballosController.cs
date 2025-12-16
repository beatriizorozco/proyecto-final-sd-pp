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
    public class CaballosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CaballosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Caballo>>> GetCaballos()
        {
            return await _context.Caballos.ToListAsync();
        }

        // GET
        [HttpGet("{id}")]
        public async Task<ActionResult<Caballo>> GetCaballo(int id)
        {
            var caballo = await _context.Caballos.FindAsync(id);

            if (caballo == null)
            {
                return NotFound();
            }

            return caballo;
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCaballo(int id, Caballo caballo)
        {
            if (id != caballo.Id)
            {
                return BadRequest();
            }

            _context.Entry(caballo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await CaballoExistsAsync(id))
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
        public async Task<ActionResult<Caballo>> PostCaballo(Caballo caballo)
        {
            _context.Caballos.Add(caballo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCaballo", new { id = caballo.Id }, caballo);
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCaballo(int id)
        {
            var caballo = await _context.Caballos.FindAsync(id);
            if (caballo == null)
            {
                return NotFound();
            }

            _context.Caballos.Remove(caballo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private Task<bool> CaballoExistsAsync(int id)
        {
            return _context.Caballos.AnyAsync(e => e.Id == id);
        }
    }
}
