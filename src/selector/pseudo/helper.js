import { markFunction } from "../../helper";

export function createPositionalPseudo( fn ) {
	return markFunction( ( elements, token ) => {
		token.data       = +token.data;
		var j, matches   = [],
			matchIndexes = fn( [], elements.length, token ),
			i            = matchIndexes.length;

		while( i-- ) {
			if( elements[ ( j = matchIndexes[ i ] ) ] ) {
				elements[ j ] = !( matches[ j ] = elements[ j ] );
			}
		}
		return matches;
	} );
}

export function oddOrEven( isodd, result, totalFound ) {
	var i = ( isodd ) ? 1 : 0;
	for( ; i < totalFound; i += 2 ) {
		result.push( i );
	}
	return result;
}