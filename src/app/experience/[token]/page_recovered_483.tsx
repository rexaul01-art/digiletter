            {/* Polaroid Grid for interactive flips (displays default doodles if no photos were attached) */}
            <div className="grid grid-cols-3 gap-4 w-full min-h-[180px] py-4 relative z-10">
              {[0, 1, 2].map((i) => {
                const isFlipped = polaroidsFlipped[i];
                const hasPhoto = giftData.photos && giftData.photos[i] && giftData.photos[i].trim() !== "";
                const defaultFronts = ["🔑", "❤️", "♾️"];
                const defaultCaptions = ["Key to my heart", "My whole heart", "To infinity & beyond"];
                const photoSrc = hasPhoto ? giftData.photos[i] : null;

                return (
                  <div 
                    key={i} 
                    onClick={() => flipPolaroid(i)}
                    className="aspect-[3/4] w-full cursor-pointer perspective-[1000px] h-full"
                  >
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 12 }}
                      className="w-full h-full relative preserve-3d transition-transform shadow-offset-sm rounded-xl border-thick bg-white"
                    >
                      {/* BACK SIDE (Face Down) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center p-2 bg-[#FCF8F2] rounded-xl z-20">
                        <div className="w-8 h-8 rounded-full bg-pastel-pink border border-[#171717] flex items-center justify-center">
                          <Heart className="w-4 h-4 text-[#FF5A4E] fill-[#FF5A4E]" />
                        </div>
                        <span className="font-handwritten text-[10px] mt-2 text-[#171717]">Flip me</span>
                      </div>

                      {/* FRONT SIDE (Face Up) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 flex flex-col justify-between p-2 rounded-xl bg-white z-10">
                        {hasPhoto && photoSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photoSrc} alt="" className="w-full aspect-square object-cover border border-[#171717] rounded" />
                        ) : (
                          <div className="w-full aspect-square bg-pastel-pink border border-[#171717] rounded flex items-center justify-center text-3xl select-none">
                            {defaultFronts[i]}
                          </div>
                        )}
                        <p className="font-handwritten text-center text-[10px] text-black overflow-hidden whitespace-nowrap mt-1 pb-1">
                          {hasPhoto ? "Memories" : defaultCaptions[i]}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>