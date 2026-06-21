import { Quit, WindowMinimise } from '../../wailsjs/runtime/runtime'

interface HeaderProps {
	statusLabel: string
	statusDotClass: string
}

export function Header({ statusLabel, statusDotClass }: HeaderProps) {
	return (
		<div className='header-row'>
			<div className='header-content'>
				<div className='brand-inline'>
					<div className='brand-logo'>vP</div>
					<div className='brand-text'>
						<div className='brand-main'>VOID</div>
						<div className='brand-sub'>PRESENCE</div>
					</div>
				</div>

				<div className='header-right-side'>
					<div className='window-controls'>
						<button
							className='win-btn'
							onClick={() => WindowMinimise()}
							title='Minimize'
							type='button'
						>
							<svg
								width='10'
								height='1'
								viewBox='0 0 10 1'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<line y1='0.5' x2='10' y2='0.5' stroke='currentColor' strokeWidth='1' />
							</svg>
						</button>
						<button
							className='win-btn close-btn'
							onClick={() => Quit()}
							title='Close'
							type='button'
						>
							<svg
								width='9'
								height='9'
								viewBox='0 0 9 9'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M1 1L8 8M8 1L1 8'
									stroke='currentColor'
									strokeWidth='1'
									strokeLinecap='round'
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
