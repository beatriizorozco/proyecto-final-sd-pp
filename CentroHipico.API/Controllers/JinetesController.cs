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
    public class JinetesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public JinetesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Jinete>>> GetJinetes()
        {
            return await _context.Jinetes.ToListAsync();
        }

        // GET
        [HttpGet("{id}")]
        public async Task<ActionResult<Jinete>> GetJinete(int id)
        {
            var jinete = await _context.Jinetes.FindAsync(id);

            if (jinete == null)
            {
                return NotFound();
            }

            return jinete;
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutJinete(int id, Jinete jinete)
        {
            if (id != jinete.Id)
            {
                return BadRequest();
            }

            _context.Entry(jinete).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await JineteExistsAsync(id))
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
        public async Task<ActionResult<Jinete>> PostJinete(Jinete jinete)
        {
            _context.Jinetes.Add(jinete);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetJinete", new { id = jinete.Id }, jinete);
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJinete(int id)
        {
            var jinete = await _context.Jinetes.FindAsync(id);
            if (jinete == null)
            {
                return NotFound();
            }

            _context.Jinetes.Remove(jinete);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private Task<bool> JineteExistsAsync(int id)
        {
            return _context.Jinetes.AnyAsync(e => e.Id == id);
        }
    }
}
